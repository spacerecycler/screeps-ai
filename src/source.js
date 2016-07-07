let sh = require('shared');
Source.prototype.countHarvestSpots = function() {
    let count = 0;
    let tiles = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y-1, this.pos.x-1, this.pos.y+1, this.pos.x+1, true);
    for(let tile of tiles) {
        if(tile.terrain != 'wall') {
            count++;
        }
    }
    return count;
};
Source.prototype.needsHarvester = function() {
    let creeps = this.room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return creep.memory.role == sh.CREEP_HARVESTER
                && creep.memory.targetSource == this.id;
        }
    });
    return _.size(creeps) < this.countHarvestSpots();
};
