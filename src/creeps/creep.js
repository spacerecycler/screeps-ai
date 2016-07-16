let sh = require('shared');
let flatMap = _.compose(_.compact, _.flatten, _.map);
Creep.prototype.run = function() {
    this.setupMem();
    if(this.memory.role == sh.CREEP_TRANSPORTER || this.ensureRoom()) {
        // if(!this.isCreepWorking()) {
        //     let full = this.fillEnergy();
        //     if(!full) {
        //         return;
        //     }
        // }
        if(this.memory.role == sh.CREEP_HARVESTER) {
            this.runHarvester();
            return;
        }
        if(this.carryCapacity == 0 || this.isCreepWorking()) {
            switch (this.memory.role) {
                case sh.CREEP_UPGRADER:
                    this.runUpgrader();
                    return;
                case sh.CREEP_BUILDER:
                    this.runBuilder();
                    return;
                case sh.CREEP_REPAIRER:
                    this.runRepairer();
                    return;
                case sh.CREEP_CAPTURER:
                    this.runCapturer();
                    return;
                case sh.CREEP_FILLER:
                    this.runFiller();
                    return;
                case sh.CREEP_TRANSPORTER:
                    this.runTransporter();
                    return;
                case sh.CREEP_SCOUT:
                    this.runScout();
                    return;
                case sh.CREEP_WARRIOR:
                    this.runWarrior();
                    return;
                case sh.CREEP_RANGER:
                    this.runRanger();
                    return;
                case sh.CREEP_HEALER:
                    this.runHealer();
                    return;
            }
        } else {
            if(this.memory.role != sh.CREEP_TRANSPORTER
                || this.ensureRoom()) {
                this.fillEnergy();
            }
        }
    }
};
Creep.prototype.setupMem = function() {
    if(this.memory.numWorkParts == null) {
        this.memory.numWorkParts = 0;
        for(let part of this.body) {
            if(part.type == WORK) {
                this.memory.numWorkParts++;
            }
        }
    }
    if(this.memory.role == sh.CREEP_HARVESTER
        && this.memory.targetSource == null
        && Game.rooms[this.memory.room] != null) {
        let sources = Game.rooms[this.memory.room].findSourcesForHarvester();
        if(_.isEmpty(sources)) {
            this.suicide();
        } else {
            this.memory.targetSource = _.head(sources).id;
        }
    }
};
Creep.prototype.runBuilder = function() {
    let target = Game.getObjectById(this.memory.targetId);
    if(target == null) {
        target = this.pos.findNearestConstructionSite([STRUCTURE_WALL,STRUCTURE_RAMPART]);
    }
    if(target == null) {
        target = this.pos.findNearestConstructionSite([STRUCTURE_ROAD]);
    }
    if(target == null) {
        target = this.pos.findNearestConstructionSite([STRUCTURE_TOWER,STRUCTURE_EXTENSION]);
    }
    if(target == null) {
        target = this.pos.findNearestConstructionSite([STRUCTURE_CONTAINER]);
    }
    if(target == null) {
        target = this.pos.findNearestConstructionSite();
    }
    if(target == null && _.size(Game.constructionSites) > 0) {
        target = _.values(Game.constructionSites)[0];
        this.memory.room = target.room.name;
    }
    if(target != null) {
        this.memory.targetId = target.id;
        if(this.build(target) == ERR_NOT_IN_RANGE) {
            this.moveToS(target);
        }
    } else {
        this.idle();
    }
};
Creep.prototype.runFiller = function() {
    let target = null;
    if(!this.room.hasHostileAttacker()) {
        target = this.pos.findNearestFillTarget([STRUCTURE_EXTENSION]);
        if(target == null) {
            target = this.pos.findNearestFillTarget([STRUCTURE_SPAWN]);
        }
    }
    if(target == null) {
        target = this.pos.findNearestFillTarget([STRUCTURE_TOWER]);
    }
    if(target != null) {
        if(this.pos.isNearTo(target)) {
            this.transfer(target, RESOURCE_ENERGY);
        } else {
            this.moveToS(target);
        }
    } else {
        this.idle();
    }
};
Creep.prototype.runTransporter = function() {
    let target = Game.getObjectById(this.memory.targetId);
    if(target == null) {
        _.forEach(Memory.config.rooms, (name) => {
            let room = Game.rooms[name];
            if(room != null && room.isMine() && room.isStorageNotFull()) {
                target = room.storage;
                return false;
            }
        });
    }
    if(target == null) {
        let targets = flatMap(Memory.config.rooms, (name) =>{
            let room = Game.rooms[name];
            if(room != null && room.isMine()) {
                return room.findNotFullContainers();
            }
        });
        if(_.size(targets) > 0) {
            target = targets[0];
            this.memory.targetId = target.id;
        }
    }
    if(target != null) {
        if(target.store[RESOURCE_ENERGY] == target.storeCapacity) {
            delete this.memory.targetId;
        } else {
            if(this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveToS(target);
            }
        }
    }
};
Creep.prototype.runHarvester = function() {
    if(!this.isCreepWorking()) {
        let targetSource = Game.getObjectById(this.memory.targetSource);
        if(this.pos.isNearTo(targetSource)) {
            let energyTaken = 0;
            if(this.harvest(targetSource) == OK) {
                energyTaken = Math.min(this.memory.numWorkParts*HARVEST_POWER, targetSource.energy);
                targetSource.energy -= energyTaken;
            }
            if(this.carry[RESOURCE_ENERGY] + energyTaken < this.carryCapacity) {
                return;
            }
        } else {
            this.moveToS(targetSource);
            return;
        }
    }
    let target = null;
    target = this.pos.findNearestNotFullLink();
    if(target != null && !this.pos.isNearTo(target)) {
        target = null;
    }
    if(target == null && this.room.isStorageNotFull()) {
        target = this.room.storage;
    }
    if(target == null) {
        target = this.pos.findNearestNotFullContainer();
    }
    if(target == null) {
        target = this.pos.findNearestFillTarget([STRUCTURE_EXTENSION]);
    }
    if(target == null) {
        target = this.pos.findNearestFillTarget([STRUCTURE_SPAWN]);
    }
    if(target != null) {
        if(this.pos.isNearTo(target)) {
            this.transfer(target, RESOURCE_ENERGY);
        } else {
            this.moveToS(target);
        }
    } else {
        this.idle();
    }
};
Creep.prototype.runUpgrader = function() {
    let target = this.room.controller;
    if(this.upgradeController(target) == ERR_NOT_IN_RANGE) {
        this.moveToS(target);
    }
};
Creep.prototype.runRepairer = function() {
    let target = this.tryRepair(this.memory);
    if(target == null) {
        target = Game.getObjectById(_.head(_.filter(Memory.config.blacklist, (id) => {
            return Game.getObjectById(id).room.name == this.room.name;
        })));
        if(target != null && this.dismantle(target) == ERR_NOT_IN_RANGE) {
            this.moveToS(target);
        }
    }
    if(target == null) {
        this.idle();
    }
};
Creep.prototype.runCapturer = function() {
    if(this.pos.isNearTo(this.room.controller)) {
        if(Memory.config.canClaim) {
            this.claimController(this.room.controller);
            delete this.room.memory.type;
            delete this.room.memory.needReserve;
            Memory.config.canClaim = false;
        } else {
            this.reserveController(this.room.controller);
        }
    } else {
        this.moveToS(this.room.controller);
    }
};
Creep.prototype.runScout = function() {
    let targets = this.room.find(FIND_SOURCES);
    let target = _.head(targets);
    if(!this.pos.isNearTo(target)) {
        this.moveToS(target);
    } else {
        this.suicide();
    }
};
Creep.prototype.runWarrior = function() {
    let target = this.pos.findNearestAttacker();
    if(target != null) {
        if(this.attack(target) == ERR_NOT_IN_RANGE) {
            this.moveToS(target);
        }
    } else {
        this.idle();
    }
};
Creep.prototype.runRanger = function() {
    let target = this.pos.findNearestAttacker();
    if(target != null) {
        if(this.pos.inRangeTo(target, 3)) {
            this.rangedAttack(target);
        } else {
            this.moveToS(target);
        }
    } else {
        this.idle();
    }
};
Creep.prototype.runHealer = function() {
    let target = this.pos.findNearestHurtCreep();
    if(target != null) {
        if(this.pos.isNearTo(target)) {
            this.heal(target);
        } else {
            this.rangedHeal(target);
            this.moveToS(target);
        }
    } else {
        this.idle();
    }
};
Creep.prototype.ensureRoom = function() {
    if(this.room.name != this.memory.room) {
        let exitDir = this.memory.exitDir;
        if(exitDir == null) {
            exitDir = this.room.findExitTo(this.memory.room);
            this.memory.exitDir = exitDir;
        }
        let exit = this.pos.findClosestByRange(exitDir);
        this.moveToS(exit);
        return false;
    } else {
        if(this.memory.exitDir != null) {
            delete this.memory.exitDir;
        }
        return true;
    }
};
Creep.prototype.idle = function() {
    let flag = this.pos.findNearestIdleFlag();
    if(!this.pos.isNearTo(flag)) {
        this.moveToS(flag);
    }
};
Creep.prototype.isCreepWorking = function() {
    // work until we have no more energy
    if(this.memory.working && this.carry[RESOURCE_ENERGY] == 0) {
        this.memory.working = false;
    }
    if(!this.memory.working && this.carry[RESOURCE_ENERGY] == this.carryCapacity) {
        this.memory.working = true;
        delete this.memory.energyTarget;
    }
    return this.memory.working;
};
Creep.prototype.fillEnergy = function() {
    // most creeps must harvest
    let target = Game.getObjectById(this.memory.energyTarget);
    if(target != null) {
        let energyLeft = 0;
        switch(target.constructor) {
            case StructureContainer:
            case StructureStorage:
                energyLeft = target.store[RESOURCE_ENERGY];
                break;
            case Source:
            case StructureLink:
                energyLeft = target.energy;
                break;
            case Resource:
                energyLeft = target.amount;
        }
        if(energyLeft == 0) {
            target = null;
            delete this.memory.energyLeft;
        }
    }
    if(target == null) {
        if(!this.room.hasHostileAttacker()) {
            target = this.pos.findClosestByRange(FIND_DROPPED_ENERGY);
        }
        if(target == null) {
            target = this.pos.findNearestNotEmptyLink();
        }
        if(target == null && this.room.isStorageNotEmpty()) {
            target = this.room.storage;
        }
        if(target == null && this.room.storage == null && this.room.getContainerCount() == 0) {
            target = this.pos.findClosestByRange(FIND_SOURCES);
        }
        if(target == null) {
            target = this.pos.findNearestNotEmptyContainer();
        }
        if(target != null) {
            this.memory.energyTarget = target.id;
        }
    }
    if(target != null) {
        if(this.pos.isNearTo(target)) {
            switch(target.constructor) {
                case Source:
                    if(this.harvest(target) == OK) {
                        target.energy -= Math.min(this.memory.numWorkParts*HARVEST_POWER, target.energy);
                    }
                    break;
                case StructureContainer:
                case StructureStorage:
                    if(this.withdraw(target, RESOURCE_ENERGY) == OK) {
                        target.store[RESOURCE_ENERGY] -= Math.min(target.store[RESOURCE_ENERGY], this.carryCapacity - this.carry[RESOURCE_ENERGY]);
                    }
                    break;
                case Resource:
                    if(this.pickup(target) == OK) {
                        target.amount -= Math.min(target.amount, this.carryCapacity - this.carryCapacity[RESOURCE_ENERGY]);
                    }
                    break;
                case StructureLink:
                    if(this.withdraw(target, RESOURCE_ENERGY) == OK) {
                        target.energy -= Math.min(target.energy, this.carryCapacity - this.carryCapacity[RESOURCE_ENERGY]);
                    }
                    break;
                default:
                    console.log('error unable to load energy');
            }
        } else {
            this.moveToS(target);
        }
    } else {
        this.idle();
    }
    return false;
};
Creep.prototype.moveToS = function(target) {
    this.moveTo(target, {reusePath: 3});
};
Creep.prototype.doRepair = function(target) {
    if(this.repair(target) == ERR_NOT_IN_RANGE) {
        this.moveToS(target);
    }
};
