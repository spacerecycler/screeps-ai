var _ = require('lodash');
var sh = require('shared');
var cr = {
    /** Run creeps **/
    runCreeps: function() {
        _.forEach(Game.creeps, (creep, name) => {
            if(name == sh.CREEP_BUILDER || cr.ensureRoom(creep)) {
                if(creep.carryCapacity == 0 || cr.isCreepWorking(creep)) {
                    switch (creep.memory.role) {
                        case sh.CREEP_HARVESTER:
                            cr.runHarvester(creep);
                            return;
                        case sh.CREEP_UPGRADER:
                            cr.runUpgrader(creep);
                            return;
                        case sh.CREEP_BUILDER:
                            cr.runBuilder(creep);
                            return;
                        case sh.CREEP_REPAIRER:
                            cr.runRepairer(creep);
                            return;
                        case sh.CREEP_CAPTURER:
                            cr.runCapturer(creep);
                            return;
                        case sh.CREEP_FILLER:
                            cr.runFiller(creep);
                            return;
                    }
                } else {
                    cr.fillEnergy(creep);
                }
            }
        });
    },
    /** @param {Creep} creep **/
    runBuilder: function(creep) {
        // prioritize walls and ramparts first
        var target = Game.getObjectById(creep.memory.targetId);
        if(target == null) {
            target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
                filter: (target) => {
                    return target.structureType == STRUCTURE_WALL
                        || target.structureType == STRUCTURE_RAMPART;
                }
            });
        }
        // then roads
        if(target == null) {
            target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
                filter: (target) => {
                    return target.structureType == STRUCTURE_ROAD;
                }
            });
        }
        // then towers
        if(target == null) {
            target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
                filter: (target) => {
                    return target.structureType == STRUCTURE_TOWER;
                }
            });
        }
        // then all other sites
        if(target == null) {
            target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        }
        if(target == null && _.size(Game.constructionSites) > 0) {
            target = _.values(Game.constructionSites)[0];
        }
        if(target != null) {
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                cr.moveTo(creep, target);
            }
        } else {
            cr.idle(creep);
        }
    },
    runFiller: function(creep) {
        // put energy first into extensions and spawns
        var target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION
                    || structure.structureType == STRUCTURE_SPAWN)
                    && structure.energy < structure.energyCapacity;
            }
        });
        // then towers
        if(target == null) {
            target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_TOWER
                        && structure.energy < structure.energyCapacity;
                }
            });
        }
        if(target != null) {
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                cr.moveTo(creep, target);
            }
        } else {
            cr.idle(creep);
        }
    },
    /** @param {Creep} creep **/
    runHarvester: function(creep) {
        var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType = STRUCTURE_CONTAINER
                    && structure.store.energy < structure.storeCapacity;
            }
        });
        if(target != null) {
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                cr.moveTo(creep, target);
            }
        } else {
            cr.idle(creep);
        }
    },
    /** @param {Creep} creep **/
    runUpgrader: function(creep) {
        var target = creep.room.controller;
        if(creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
            cr.moveTo(creep, target);
        }
    },
    runRepairer: function(creep) {
        var target = sh.doRepair(creep.pos, creep.memory, function(target) {
            if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                cr.moveTo(creep, target);
            }
        });
        if(target == null) {
            cr.idle(creep);
        }
    },
    runCapturer: function(creep) {
        if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    },
    ensureRoom: function(creep) {
        if(creep.room.name != creep.memory.room) {
            var exitDir = creep.memory.exitDir;
            if(exitDir == null) {
                exitDir = creep.room.findExitTo(creep.memory.room);
                creep.memory.exitDir = exitDir;
            }
            var exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit);
            return false;
        } else {
            if(creep.memory.exitDir != null) {
                delete creep.memory.exitDir;
            }
            return true;
        }
    },
    idle: function(creep) {
        var flag = creep.pos.findClosestByRange(FIND_FLAGS, {filter: (flag) => flag.memory.type == 'idle'});
        if(!creep.pos.inRangeTo(flag, 1)) {
            cr.moveTo(creep, flag);
        }
    },
    /** @param {Creep} creep **/
    isCreepWorking: function(creep) {
        // work until we have no more energy
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            var target = creep.pos.findClosestByRange(FIND_SOURCES);
            if(target == null) {
                console.log("can't find target " + creep.name)
            } else {
                creep.memory.energyTarget = target.id;
            }
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            delete creep.memory.energyTarget;
        }
        return creep.memory.working;
    },
    /** @param {Creep} creep **/
    fillEnergy: function(creep) {
        // most creeps must harvest
        var target = Game.getObjectById(creep.memory.energyTarget);
        if(target == null) {
            if(creep.memory.role != sh.CREEP_HARVESTER) {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER
                            && structure.store.energy > 0;
                    }
                });
                if(_.size(creep.room.find(FIND_STRUCTURES, {filter: (structure) => {return structure.structureType == STRUCTURE_CONTAINER;}})) == 0) {
                    target = creep.pos.findClosestByRange(FIND_SOURCES);
                }
            } else {
                target = creep.pos.findClosestByRange(FIND_SOURCES);
            }
            if(target != null) {
                creep.memory.energyTarget = target.id;
            }
        }
        if(target != null) {
            if(target instanceof Source) {
                if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    cr.moveTo(creep, target);
                }
            } else if(target instanceof StructureContainer) {
                if(target.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    cr.moveTo(creep, target);
                }
            }
        }
    },
    moveTo: function(creep, target) {
        creep.moveTo(target, {reusePath: 3});
    }
};
module.exports = cr;
