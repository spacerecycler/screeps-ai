let sh = require('shared');
let flatMap = _.compose(_.compact, _.flatten, _.map);
Creep.prototype.run = function() {
    if(this.memory.numWorkParts == null) {
        this.memory.numWorkParts = 0;
        for(let part of this.body) {
            if(part.type == WORK) {
                this.memory.numWorkParts++;
            }
        }
    }
    if(this.memory.role == sh.CREEP_TRANSPORTER || this.ensureRoom()) {
        if(this.carryCapacity == 0 || this.isCreepWorking()) {
            switch (this.memory.role) {
                case sh.CREEP_HARVESTER:
                    this.runHarvester();
                    return;
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
            }
        } else {
            if(this.memory.role != sh.CREEP_TRANSPORTER
                || this.ensureRoom()) {
                this.fillEnergy();
            }
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
        if(this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
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
    let target = null;
    if(this.room.isStorageNotFull()) {
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
    let target = sh.tryRepair(this, this.memory);
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
    if(this.reserveController(this.room.controller) == ERR_NOT_IN_RANGE) {
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
    if(target == null) {
        if(this.memory.role != sh.CREEP_HARVESTER) {
            if(!this.room.hasHostileAttacker()) {
                target = this.pos.findClosestByRange(FIND_DROPPED_ENERGY);
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
        } else {
            if(this.memory.targetSource == null) {
                let sources = this.room.find(FIND_SOURCES, {
                    filter: (source) => {
                        return source.needsHarvester();
                    }
                });
                this.memory.targetSource = _.head(sources).id;
            }
            target = Game.getObjectById(this.memory.targetSource);
        }
    }
    if(target != null) {
        if(target instanceof Source) {
            if(this.pos.isNearTo(target)) {
                this.harvest(target);
            } else {
                this.moveToS(target);
            }
        } else if(target instanceof StructureContainer || target instanceof StructureStorage) {
            switch(target.transfer(this, RESOURCE_ENERGY)) {
                case ERR_NOT_IN_RANGE:
                    this.moveToS(target);
                    break;
                case ERR_NOT_ENOUGH_RESOURCES:
                    delete this.memory.energyTarget;
                    break;
            }
        } else if(target instanceof Resource) {
            if(this.pickup(target) == ERR_NOT_IN_RANGE) {
                this.moveToS(target);
            }
        }
    } else {
        this.idle();
    }
};
Creep.prototype.moveToS = function(target) {
    this.moveTo(target, {reusePath: 3});
};
Creep.prototype.doRepair = function(target) {
    if(this.repair(target) == ERR_NOT_IN_RANGE) {
        this.moveToS(target);
    }
};
