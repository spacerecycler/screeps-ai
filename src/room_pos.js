let sh = require('shared');
RoomPosition.prototype.findNearestAttacker = function() {
    return this.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (t) => {
            for(let part of t.body) {
                if(sh.ATTACKER_PARTS.has(part.type)) {
                    return true;
                }
            }
            return false;
        }
    });
};
RoomPosition.prototype.findNearestHurtCreep = function() {
    return this.findClosestByRange(FIND_MY_CREEPS, {
        filter: (t) => t.hits < t.hitsMax});
};
RoomPosition.prototype.findNearestHurtStructure = function() {
    return this.findClosestByRange(FIND_STRUCTURES, {
        filter: (t) => {
            let max = t.hitsMax * 0.9;
            if(_.includes([STRUCTURE_WALL,STRUCTURE_RAMPART], t.structureType)) {
                max = Math.min(t.hitsMax, Memory.config.wallsMax * 0.9);
            } else if (!_.includes([STRUCTURE_ROAD,STRUCTURE_CONTAINER], t.structureType) && !t.my) {
                return false;
            }
            if(_.includes(Memory.config.blacklist, t.id)) {
                return false;
            }
            return t.hits < max;
        }
    });
};
RoomPosition.prototype.findNearestConstructionSite = function(types) {
    if(types == null) {
        return this.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
    } else {
        return this.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
            filter: (t) => _.includes(types, t.structureType)});
    }
};
RoomPosition.prototype.findNearestFillTarget = function(types) {
    return this.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (t) => {
            return _.includes(types, t.structureType)
                && t.energy < t.energyCapacity;
        }
    });
};
RoomPosition.prototype.findNearestNotFullLink = function() {
    return this.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (t) => {
            return t.structureType == STRUCTURE_LINK
                && t.energy < t.energyCapacity;
        }
    });
};
RoomPosition.prototype.findNearestNotEmptyLink = function() {
    return this.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (t) => {
            return t.structureType == STRUCTURE_LINK
                && t.energy > 0
                && !Memory.links[t.id].nearSource;
        }
    });
};
RoomPosition.prototype.findNearestNotFullContainer = function() {
    return this.findClosestByRange(FIND_STRUCTURES, {
        filter: (t) => {
            return t.structureType == STRUCTURE_CONTAINER
                && t.store[RESOURCE_ENERGY] < t.storeCapacity
                && !_.includes(Memory.config.blacklist, t.id);
        }
    });
};
RoomPosition.prototype.findNearestNotEmptyContainer = function() {
    return this.findClosestByRange(FIND_STRUCTURES, {
        filter: (t) => {
            return t.structureType == STRUCTURE_CONTAINER
                && t.store[RESOURCE_ENERGY] > 0;
        }
    });
};
RoomPosition.prototype.findNearestIdleFlag = function() {
    return this.findClosestByRange(FIND_FLAGS, {
        filter: (t) => t.memory.type == sh.FLAG_IDLE});
};
