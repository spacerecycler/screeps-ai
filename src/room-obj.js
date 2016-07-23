'use strict';
RoomObject.prototype.tryRepair = function(mem) {
    let target = Game.getObjectById(mem.targetId);
    // logic below to only repair things when they are 90% damaged
    // also cap hitpoints for walls since they have so many
    if(target != null) {
        let max = target.hitsMax;
        if(_.includes([STRUCTURE_WALL,STRUCTURE_RAMPART],
            target.structureType)) {
            max = Math.min(target.hitsMax, this.room.memory.wallsMax);
        }
        if(target.hits >= max) {
            delete mem.targetId;
            target = null;
        }
    }
    if(target == null) {
        target = this.pos.findNearestHurtStructure([STRUCTURE_RAMPART]);
        if(target == null) {
            target = this.pos.findNearestHurtStructure();
        }
        if(target != null) {
            mem.targetId = target.id;
        }
    }
    if(target != null) {
        this.doRepair(target);
    }
    return target;
};
RoomObject.prototype.findNearbyHostile = function() {
    return this.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {
        filter: (t) => t.owner.username != 'Source Keeper' || t.hits > 100
    });
};
RoomObject.prototype.isHostileNearby = function() {
    return !_.isEmpty(this.findNearbyHostile());
};
RoomObject.prototype.getEnergy = function() {
    console.log('get energy not implemented');
    return 0;
};
RoomObject.prototype.getProjectedEnergy = function() {
    if(this.projectedEnergy == null) {
        this.projectedEnergy = this.getEnergy();
    }
    return this.projectedEnergy;
};
RoomObject.prototype.giveEnergy = function(creep) {
    let maxPull = creep.carryCapacity - creep.carry[RESOURCE_ENERGY];
    if(this instanceof Source) {
        maxPull = creep.memory.numWorkParts*HARVEST_POWER;
    }
    let ret = this.doGiveEnergy(creep);
    if(ret == OK) {
        let energyTaken = Math.min(maxPull, this.getProjectedEnergy());
        this.projectedEnergy -= energyTaken;
    }
    return ret;
};
RoomObject.prototype.doGiveEnergy = function() {
    console.log('do give energy not implemented');
    return ERR_INVALID_TARGET;
};
