import { ATTACKER_PARTS, CreepTypeConstant } from "shared";
RoomPosition.prototype.findNearestAttacker = function() {
    const attacker = this.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (t) => {
            for (const part of t.body) {
                if (ATTACKER_PARTS.has(part.type)) {
                    return true;
                }
            }
            return false;
        }
    });
    if (attacker == null) {
        return null;
    }
    const healer = this.findClosestByRange(FIND_HOSTILE_CREEPS,
        { filter: (t) => t.body.map((p) => p.type).includes(HEAL) });
    if (healer != null) {
        return healer;
    } else {
        return attacker;
    }
};
RoomPosition.prototype.findNearestHurtCreep = function(roles) {
    return this.findClosestByRange(FIND_MY_CREEPS, {
        filter: (t) => {
            if (roles == null) {
                return t.hits < t.hitsMax;
            } else {
                return roles.includes(t.memory.role) && t.hits < t.hitsMax;
            }
        }
    });
};
RoomPosition.prototype.findNearestHurtStructure = function(types) {
    return this.findClosestByRange<Structure>(FIND_STRUCTURES, {
        filter: (t) => {
            let max = t.hitsMax * 0.9;
            if (t instanceof StructureWall || t instanceof StructureRampart) {
                max = Math.min(t.hitsMax, Memory.rooms[this.roomName].wallsMax * 0.9);
            } else if (t instanceof OwnedStructure && !t.my) {
                return false;
            }
            if (Memory.config.blacklist[this.roomName].includes(t.id)) {
                return false;
            }
            if (types != null && !types.includes(t.structureType)) {
                return false;
            }
            return t.hits < max;
        }
    });
};
RoomPosition.prototype.findNearestConstructionSite = function(types) {
    if (types == null) {
        return this.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
    } else {
        return this.findClosestByPath(FIND_MY_CONSTRUCTION_SITES,
            { filter: (t) => types.includes(t.structureType) });
    }
};
RoomPosition.prototype.findNearestFillTarget = function(type) {
    return this.findClosestByRange<FillTarget>(FIND_MY_STRUCTURES, {
        filter: (t) => {
            const ft = t as FillTarget;
            return type == t.structureType && ft.energy < ft.energyCapacity;
        }
    });
};
RoomPosition.prototype.findNearestNotFullLink = function() {
    return this.findClosestByRange<StructureLink>(FIND_MY_STRUCTURES,
        { filter: (t) => t.structureType == STRUCTURE_LINK && t.energy < t.energyCapacity });
};
RoomPosition.prototype.findNearestNotEmptyLink = function() {
    return this.findClosestByPath<StructureLink>(FIND_MY_STRUCTURES,
        { filter: (t) => t.structureType == STRUCTURE_LINK && t.energy > 0 && !Memory.links[t.id].nearSource });
};
RoomPosition.prototype.findNearestNotFullContainer = function() {
    return this.findClosestByRange<StructureContainer>(FIND_STRUCTURES, {
        filter: (t) => {
            return t.structureType == STRUCTURE_CONTAINER && t.store[RESOURCE_ENERGY] < t.storeCapacity
                && !Memory.config.blacklist[this.roomName].includes(t.id);
        }
    });
};
RoomPosition.prototype.findNearbyNotFullContainer = function() {
    return this.findClosestByRange<StructureContainer>(FIND_STRUCTURES, {
        filter: (t) => {
            return t.structureType == STRUCTURE_CONTAINER && t.store[RESOURCE_ENERGY] < t.storeCapacity
                && !Memory.config.blacklist[this.roomName].includes(t.id) && this.inRangeTo(t, 3);
        }
    });
};
RoomPosition.prototype.findNearestNotEmptyContainer = function() {
    return this.findClosestByPath<StructureContainer>(FIND_STRUCTURES,
        { filter: (t) => t.structureType == STRUCTURE_CONTAINER && t.store[RESOURCE_ENERGY] > 0 });
};
RoomPosition.prototype.findNearestIdleFlag = function() {
    return this.findClosestByRange(FIND_FLAGS, { filter: (t) => t.isIdle() });
};
RoomPosition.prototype.findNearestWall = function() {
    return this.findClosestByRange<StructureWall>(FIND_STRUCTURES,
        { filter: (t) => t.structureType == STRUCTURE_WALL });
};
