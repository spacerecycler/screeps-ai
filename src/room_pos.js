let sh = require('shared');
RoomPosition.prototype.findNearestAttacker = function() {
    return this.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (target) => {
            let hasAttack = false;
            _.forEach(target.body, (part) => {
                if(_.includes(sh.ATTACKER_PARTS, part.type)) {
                    hasAttack = true;
                    return false;
                }
            });
            return hasAttack;
        }
    });
};
RoomPosition.prototype.findNearestHurtCreep = function() {
    return this.findClosestByRange(FIND_MY_CREEPS, {
        filter: (target) => target.hits < target.hitsMax
    });
};
RoomPosition.prototype.findNearestHurtStructure = function() {
    return this.findClosestByRange(FIND_STRUCTURES, {
        filter: (target) => {
            let max = target.hitsMax * 0.9;
            if(_.includes([STRUCTURE_WALL,STRUCTURE_RAMPART], target.structureType)) {
                max = Math.min(target.hitsMax, Memory.config.wallsMax * 0.9);
            } else if (!_.includes([STRUCTURE_ROAD,STRUCTURE_CONTAINER], target.structureType) && !target.my) {
                return false;
            }
            if(_.includes(Memory.config.blacklist, target.id)) {
                return false;
            }
            return target.hits < max;
        }
    });
};
RoomPosition.prototype.findNearestConstructionSite = function(types) {
    if(types == null) {
        return this.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
    } else {
        return this.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
            filter: (target) => {
                return _.includes(types, target.structureType);
            }
        });
    }
};
RoomPosition.prototype.findNearestFillTarget = function(types) {
    return this.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (target) => {
            return _.includes(types, target.structureType)
                && target.energy < target.energyCapacity;
        }
    });
};
RoomPosition.prototype.findNearestNotFullContainer = function() {
    return this.findClosestByRange(FIND_STRUCTURES, {
        filter: (target) => {
            return target.structureType == STRUCTURE_CONTAINER
                && target.store[RESOURCE_ENERGY] < target.storeCapacity
                && !_.includes(Memory.config.blacklist, target.id);
        }
    });
};
RoomPosition.prototype.findNearestNotEmptyContainer = function() {
    return this.findClosestByRange(FIND_STRUCTURES, {
        filter: (target) => {
            return target.structureType == STRUCTURE_CONTAINER
                && target.store[RESOURCE_ENERGY] > 0;
        }
    });
};
RoomPosition.prototype.findNearestIdleFlag = function() {
    return this.findClosestByRange(FIND_FLAGS, {filter: (flag) => flag.memory.role == sh.FLAG_IDLE});
};
