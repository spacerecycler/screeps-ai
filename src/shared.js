var _ = require('lodash');
var c = require('config');
var sh = {
    CREEP_HARVESTER: 'harvester',
    CREEP_UPGRADER: 'upgrader',
    CREEP_BUILDER: 'builder',
    CREEP_REPAIRER: 'repairer',
    CREEP_CAPTURER: 'capturer',
    CREEP_FILLER: 'filler',
    ROOM_HOME: 'home',
    ROOM_EXPANSION: 'expansion',
    FLAG_IDLE: 'idle',
    doRepair: function(pos, mem, repairFn) {
        var target = Game.getObjectById(mem.targetId);
        // logic below to only repair things when they are 90% damaged
        // also cap hitpoints for walls since they have so many
        if(target == null) {
            target = pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (target) => {
                    var max = target.hitsMax * 0.9;
                    if(_.includes([STRUCTURE_WALL,STRUCTURE_RAMPART], target.structureType)) {
                        max = Math.min(target.hitsMax, c.wallsMax * 0.9);
                    } else if (!_.includes([STRUCTURE_ROAD,STRUCTURE_CONTAINER], target.structureType) && !target.my) {
                        return false;
                    }
                    return target.hits < max;
                }
            });
            if(target != null) {
                mem.targetId = target.id;
            }
        }
        if(target != null) {
            var max = target.hitsMax;
            if(_.includes([STRUCTURE_WALL,STRUCTURE_RAMPART], target.structureType)) {
                max = Math.min(target.hitsMax, c.wallsMax);
            }
            if(target.hits >= max) {
                delete mem.targetId;
            } else {
                repairFn(target);
            }
        }
        return target;
    },
    findConstructionSite: function(creep, types) {
        if(types == null) {
            return creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        } else {
            return creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
                filter: (target) => {
                    return _.includes(types, target.structureType);
                }
            });
        }
    },
    findFillTarget: function(creep, types) {
        return creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (target) => {
                return _.includes(types, target.structureType)
                    && target.energy < target.energyCapacity;
            }
        });
    }
};
module.exports = sh;
