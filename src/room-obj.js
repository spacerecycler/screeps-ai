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
