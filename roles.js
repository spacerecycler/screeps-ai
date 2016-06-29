var wallsMax = 25000;
var roles = {
    /** @param {Creep} creep **/
    runCreep: function(creep) {
        if(roles.isCreepWorking(creep)) {
            switch (creep.memory.role) {
                case 'harvester':
                    roles.runHarvester(creep);
                    break;
                case 'upgrader':
                    roles.runUpgrader(creep);
                    break;
                case 'builder':
                    roles.runBuilder(creep);
                    break;
                case 'repairer':
                    roles.runRepairer(creep);
                    break;
                default:
                    break;
            }
        } else {
            roles.goHarvest(creep);
        }
    },
    /** @param {Creep} creep **/
    runBuilder: function(creep) {
        var target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {filter: (target) => {return target.structureType == STRUCTURE_WALL;}});
        if(target == null) {
            target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {filter: (target) => {return target.structureType == STRUCTURE_ROAD;}});
        }
        if(target == null) {
            target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {filter: (target) => {return target.structureType == STRUCTURE_TOWER;}});
        }
        if(target == null) {
            target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        }
        if(target != null) {
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                roles.moveTo(creep, target);
            }
        } else {
            if(!creep.pos.inRangeTo(Game.flags.Idle, 1)) {
                roles.moveTo(creep, Game.flags.Idle);
            }
        }
    },
    /** @param {Creep} creep **/
    runHarvester: function(creep) {
        var targets = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => { return (structure.structureType == STRUCTURE_EXTENSION
                || structure.structureType == STRUCTURE_SPAWN
                || structure.structureType == STRUCTURE_TOWER)
                && structure.energy < structure.energyCapacity;
            }
        });
        if(targets.length > 0) {
            var target = targets[0];
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                roles.moveTo(creep, target);
            }
        } else {
            if(!creep.pos.inRangeTo(Game.flags.Idle, 1)) {
                roles.moveTo(creep, Game.flags.Idle);
            }
        }
    },
    /** @param {Creep} creep **/
    runUpgrader: function(creep) {
        var target = creep.room.controller;
        if(creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
            roles.moveTo(creep, target);
        }
    },
    towerRepair: function(tower) {
        var target = Game.getObjectById(Memory.towerTargetId);
        if(target == null) {
            target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    var max = structure.hitsMax * 0.9;
                    if(structure.structureType == STRUCTURE_WALL) {
                        max = structure.hitsMax < wallsMax * 0.9 ? structure.hitsMax : wallsMax * 0.9;
                    } else if (structure.structureType != STRUCTURE_ROAD && !structure.my) {
                        return false;
                    }
                    return structure.hits < max;
                }
            });
            if(target != null) {
                Memory.towerTargetId = target.id;
            }
        }
        if(target != null) {
            var max = target.hitsMax;
            if(target.structureType == STRUCTURE_WALL) {
                max = target.hitsMax < wallsMax ? target.hitsMax : wallsMax;
            }
            if(target.hits >= max) {
                delete Memory.towerTargetId;
            } else {
                tower.repair(target)
            }
        }
    },
    runRepairer: function(creep) {
        var target = Game.getObjectById(creep.memory.targetId);
        if(target == null) {
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    var max = structure.hitsMax * 0.9;
                    if(structure.structureType == STRUCTURE_WALL) {
                        max = structure.hitsMax < wallsMax * 0.9 ? structure.hitsMax : wallsMax * 0.9;
                    } else if (structure.structureType != STRUCTURE_ROAD && !structure.my) {
                        return false;
                    }
                    return structure.hits < max;
                }
            });
            if(target != null) {
                creep.memory.targetId = target.id;
            }
        }
        if(target != null) {
            var max = target.hitsMax;
            if(target.structureType == STRUCTURE_WALL) {
                max = target.hitsMax < wallsMax ? target.hitsMax : wallsMax;
            }
            if(target.hits >= max) {
                delete creep.memory.targetId;
            } else {
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    roles.moveTo(creep, target);
                }
            }
        } else {
            if(!creep.pos.inRangeTo(Game.flags.Idle, 1)) {
                roles.moveTo(creep, Game.flags.Idle);
            }
        }
    },
    /** @param {Creep} creep **/
    isCreepWorking: function(creep) {
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }
        return creep.memory.working;
    },
    /** @param {Creep} creep **/
    goHarvest: function(creep) {
        var targets = creep.room.find(FIND_SOURCES);
        var target = targets[0];
        if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
            roles.moveTo(creep, target);
        }
    },
    moveTo: function(creep, target) {
        creep.moveTo(target, {reusePath: 3});
    }
};
module.exports = roles;
