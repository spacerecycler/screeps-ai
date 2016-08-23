'use strict';
let sh = require('shared');
RoomPosition.prototype.findNearestAttacker = function() {
    let attacker = this.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (t) => {
            for(let part of t.body) {
                if(sh.ATTACKER_PARTS.has(part.type)) {
                    return true;
                }
            }
            return false;
        }
    });
    if(attacker == null) {
        return null;
    }
    let healer = this.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (t) => {
            for(let part of t.body) {
                if(part.type == HEAL) {
                    return true;
                }
            }
            return false;
        }
    });
    if(healer != null) {
        return healer;
    } else {
        return attacker;
    }
};
RoomPosition.prototype.findNearestHurtCreep = function(roles) {
    return this.findClosestByRange(FIND_MY_CREEPS, {
        filter: (t) => {
            if(roles == null) {
                return t.hits < t.hitsMax;
            } else {
                return _.includes(roles, t.memory.role) && t.hits < t.hitsMax;
            }
        }});
};
RoomPosition.prototype.findNearestHurtStructure = function(types) {
    return this.findClosestByRange(FIND_STRUCTURES, {
        filter: (t) => {
            let max = t.hitsMax * 0.9;
            if(_.includes([STRUCTURE_WALL,STRUCTURE_RAMPART],
                t.structureType)) {
                max = Math.min(t.hitsMax,
                    Memory.rooms[this.roomName].wallsMax * 0.9);
            } else if (!_.includes([STRUCTURE_ROAD,STRUCTURE_CONTAINER],
                t.structureType) && !t.my) {
                return false;
            }
            if(_.includes(Memory.config.blacklist[this.roomName], t.id)) {
                return false;
            }
            if(types != null && !_.includes(types, t.structureType)) {
                return false;
            }
            return t.hits < max;
        }
    });
};
RoomPosition.prototype.findNearestConstructionSite = function(types) {
    if(types == null) {
        return this.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
    } else {
        return this.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
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
    return this.findClosestByPath(FIND_MY_STRUCTURES, {
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
                && !_.includes(Memory.config.blacklist[this.roomName], t.id);
        }
    });
};
RoomPosition.prototype.findNearbyNotFullContainer = function() {
    return this.findClosestByRange(FIND_STRUCTURES, {
        filter: (t) => {
            return t.structureType == STRUCTURE_CONTAINER
                && t.store[RESOURCE_ENERGY] < t.storeCapacity
                && !_.includes(Memory.config.blacklist[this.roomName], t.id)
                && this.inRangeTo(t, 3);
        }
    });
};
RoomPosition.prototype.findNearestNotEmptyContainer = function() {
    return this.findClosestByPath(FIND_STRUCTURES, {
        filter: (t) => {
            return t.structureType == STRUCTURE_CONTAINER
                && t.store[RESOURCE_ENERGY] > 0;
        }
    });
};
RoomPosition.prototype.findNearestIdleFlag = function() {
    return this.findClosestByRange(FIND_FLAGS, {filter: (t) => t.isIdle()});
};
