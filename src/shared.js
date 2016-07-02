var _ = require('lodash');
var c = require('config');
var sh = {
    CREEP_HARVESTER: 'harvester',
    CREEP_UPGRADER: 'upgrader',
    CREEP_BUILDER: 'builder',
    CREEP_REPAIRER: 'repairer',
    CREEP_CAPTURER: 'capturer',
    CREEP_FILLER: 'filler',
    doRepair: function(pos, mem, repairFn) {
        var target = Game.getObjectById(mem.targetId);
        // logic below to only repair things when they are 90% damaged
        // also cap hitpoints for walls since they have so many
        if(target == null) {
            target = pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    var max = structure.hitsMax * 0.9;
                    if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) {
                        max = structure.hitsMax < c.wallsMax * 0.9 ? structure.hitsMax : c.wallsMax * 0.9;
                    } else if (structure.structureType != STRUCTURE_ROAD && !structure.my) {
                        return false;
                    }
                    return structure.hits < max;
                }
            });
            if(target != null) {
                mem.targetId = target.id;
            }
        }
        if(target != null) {
            var max = target.hitsMax;
            if(target.structureType == STRUCTURE_WALL || target.structureType == STRUCTURE_RAMPART) {
                max = target.hitsMax < c.wallsMax ? target.hitsMax : c.wallsMax;
            }
            if(target.hits >= max) {
                delete mem.targetId;
            } else {
                repairFn(target);
            }
        }
        return target;
    }
}
module.exports = sh;
