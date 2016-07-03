var _ = require('lodash');
var sh = require('shared');
var flatMap = _.compose(_.compact, _.flatten, _.map);
Object.apply(Creep.prototype, {
    run: function() {
        if(this.memory.role == sh.CREEP_BUILDER
            || this.memory.role == sh.CREEP_TRANSPORTER || this.ensureRoom()) {
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
                }
            } else {
                if(this.memory.role != sh.CREEP_TRANSPORTER
                    || this.ensureRoom()) {
                    this.fillEnergy();
                }
            }
        }
    },
    runBuilder: function() {
        var target = Game.getObjectById(this.memory.targetId);
        if(target == null) {
            target = this.findConstructionSite([STRUCTURE_WALL, STRUCTURE_RAMPART]);
        }
        if(target == null) {
            target = this.findConstructionSite([STRUCTURE_ROAD]);
        }
        if(target == null) {
            target = this.findConstructionSite([STRUCTURE_TOWER]);
        }
        if(target == null) {
            target = this.findConstructionSite();
        }
        if(target == null && _.size(Game.constructionSites) > 0) {
            target = _.values(Game.constructionSites)[0];
        }
        if(target != null) {
            this.memory.targetId = target.id;
            if(this.build(target) == ERR_NOT_IN_RANGE) {
                this.moveToS(target);
            }
        } else {
            this.idle();
        }
    },
    runFiller: function() {
        var target = this.findFillTarget([STRUCTURE_EXTENSION]);
        if(target == null) {
            target = this.findFillTarget([STRUCTURE_SPAWN]);
        }
        if(target == null) {
            target = this.findFillTarget([STRUCTURE_TOWER]);
        }
        if(target != null) {
            if(this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveToS(target);
            }
        } else {
            this.idle();
        }
    },
    runTransporter: function() {
        var target = Game.getObjectById(this.memory.targetId);
        if(target == null) {
            var targets = flatMap(Memory.rooms, (mem, room) =>{
                if(Game.rooms[room] != null && mem.type == sh.ROOM_HOME) {
                    return Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (target) => {
                            return target.structureType == STRUCTURE_CONTAINER
                                && target.store[RESOURCE_ENERGY] < target.storeCapacity;
                        }
                    });
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
    },
    runHarvester: function() {
        var target = this.findNotFullContainer();
        if(target == null) {
            target = this.findFillTarget([STRUCTURE_EXTENSION]);
        }
        if(target == null) {
            target = this.findFillTarget([STRUCTURE_SPAWN]);
        }
        if(target != null) {
            if(this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveToS(target);
            }
        } else {
            this.idle();
        }
    },
    runUpgrader: function() {
        var target = this.room.controller;
        if(this.upgradeController(target) == ERR_NOT_IN_RANGE) {
            this.moveToS(target);
        }
    },
    runRepairer: function() {
        var target = this.doRepair(this.pos, this.memory, (target) => {
            if(this.repair(target) == ERR_NOT_IN_RANGE) {
                this.moveToS(target);
            }
        });
        if(target == null) {
            this.idle();
        }
    },
    runCapturer: function() {
        if(this.reserveController(this.room.controller) == ERR_NOT_IN_RANGE) {
            this.moveToS(this.room.controller);
        }
    },
    ensureRoom: function() {
        if(this.room.name != this.memory.room) {
            var exitDir = this.memory.exitDir;
            if(exitDir == null) {
                exitDir = this.room.findExitTo(this.memory.room);
                this.memory.exitDir = exitDir;
            }
            var exit = this.pos.findClosestByRange(exitDir);
            this.moveToS(exit);
            return false;
        } else {
            if(this.memory.exitDir != null) {
                delete this.memory.exitDir;
            }
            return true;
        }
    },
    idle: function() {
        var flag = this.pos.findClosestByRange(FIND_FLAGS, {filter: (flag) => flag.memory.type == sh.FLAG_IDLE});
        if(!this.pos.inRangeTo(flag, 1)) {
            this.moveToS(flag);
        }
    },
    isCreepWorking: function() {
        // work until we have no more energy
        if(this.memory.working && this.carry[RESOURCE_ENERGY] == 0) {
            this.memory.working = false;
        }
        if(!this.memory.working && this.carry[RESOURCE_ENERGY] == this.carryCapacity) {
            this.memory.working = true;
            delete this.memory.energyTarget;
        }
        return this.memory.working;
    },
    fillEnergy: function() {
        // most creeps must harvest
        var target = Game.getObjectById(this.memory.energyTarget);
        if(target == null) {
            if(this.memory.role != sh.CREEP_HARVESTER) {
                target = this.findNotEmptyContainer();
                if(this.room.getContainerCount() == 0) {
                    target = this.pos.findClosestByRange(FIND_SOURCES);
                }
            } else {
                target = this.pos.findClosestByRange(FIND_SOURCES);
            }
            if(target != null) {
                this.memory.energyTarget = target.id;
            }
        }
        if(target != null) {
            if(target instanceof Source) {
                if(this.harvest(target) == ERR_NOT_IN_RANGE) {
                    this.moveToS(target);
                }
            } else if(target instanceof StructureContainer) {
                switch(target.transfer(this, RESOURCE_ENERGY)) {
                    case ERR_NOT_IN_RANGE:
                        this.moveToS(target);
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        delete this.memory.energyTarget;
                        break;
                }
            }
        } else {
            this.idle();
        }
    },
    moveToS: function(target) {
        this.moveTo(target, {reusePath: 3});
    },
    findConstructionSite: function(types) {
        if(types == null) {
            return this.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        } else {
            return this.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
                filter: (target) => {
                    return _.includes(types, target.structureType);
                }
            });
        }
    },
    findFillTarget: function(types) {
        return this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (target) => {
                return _.includes(types, target.structureType)
                    && target.energy < target.energyCapacity;
            }
        });
    },
    findNotFullContainer: function() {
        return this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (target) => {
                return target.structureType == STRUCTURE_CONTAINER
                    && target.store[RESOURCE_ENERGY] < target.storeCapacity;
            }
        });
    },
    findNotEmptyContainer: function() {
        return this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (target) => {
                return target.structureType == STRUCTURE_CONTAINER
                    && target.store[RESOURCE_ENERGY] > 0;
            }
        });
    },
    doRepair: sh.doRepair
});
