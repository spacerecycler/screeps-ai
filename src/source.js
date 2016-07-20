let sh = require('shared');
Source.prototype.countHarvestSpots = function() {
    if(this.harvestSpots == null) {
        let count = 0;
        let tiles = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y-1,
            this.pos.x-1, this.pos.y+1, this.pos.x+1, true);
        for(let tile of tiles) {
            if(tile.terrain != 'wall') {
                count++;
            }
        }
        this.harvestSpots = count;
    }
    return this.harvestSpots;
};
Source.prototype.needsHarvester = function() {
    let creeps = _.filter(Game.creeps, (creep) => {
        return creep.memory.role == sh.CREEP_HARVESTER
            && creep.memory.targetSource == this.id;
    });
    let workParts = 0;
    for(let creep of creeps) {
        workParts += creep.memory.numWorkParts;
    }
    return !this.isHostileNearby() && workParts < 5
        && _.size(creeps) < this.countHarvestSpots();
};
Source.prototype.findHostileNearby = function() {
    return this.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {
        filter: (t) => t.hits > 100
    });
};
Source.prototype.isHostileNearby = function() {
    return !_.isEmpty(this.findHostileNearby());
};
Source.prototype.findNearbyKiteFlag = function() {
    return _.head(this.pos.findInRange(FIND_FLAGS, 10, {
        filter: (f) => f.memory.type == sh.FLAG_KITE
    }));
};
