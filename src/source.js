var _ = require('lodash');
var sh = require('shared');
Source.prototype.countHarvestSpots = function() {
    var count = 0;
    var tiles = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y-1, this.pos.x-1, this.pos.y+1, this.pos.x+1, true);
    _.forEach(tiles, function(tile) {
        if(tile.terrain != 'wall') {
            count++;
        }
    });
    return count;
};
Source.prototype.needsHarvester = function() {
    var creeps = this.room.find(FIND_MY_CREEPS, {
        filter: function(creep) {
            return creep.memory.role == sh.CREEP_HARVESTER && creep.memory.targetSource == this.id;
        }
    });
    return _.size(creeps) < this.countHarvestSpots();
};
