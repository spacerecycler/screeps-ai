var _ = require('lodash');
Room.prototype.run = function() {
    if(this.memory.maxHarvesters == null) {
        var count = 0;
        var sources = this.find(FIND_SOURCES);
        _.forEach(sources, (source) => {
            var tiles = this.lookForAtArea(LOOK_TERRAIN, source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true);
            _.forEach(tiles, (tile) => {
                if(tile.terrain != 'wall') {
                    count++;
                }
            });
        });
        this.memory.maxHarvesters = count;
    }
    if(this.mode == MODE_SIMULATION && !this.memory.test) {
        var goals = _.map(this.find(FIND_SOURCES), function(source) {
            return { pos: source.pos, range: 1};
        });
        var vals = PathFinder.search(Game.spawns[Spawn1].pos, goals);
        console.log(vals);
        this.memory.test = true;
    }
    var spawns = this.find(FIND_MY_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_SPAWN});
    _.forEach(spawns, (spawn) => {
        spawn.run();
    });
    var towers = this.find(FIND_MY_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_TOWER});
    _.forEach(towers, (tower) => {
        tower.run();
    });
};
Room.prototype.isMine = function() {
    if(this.controller != null) {
        return this.controller.my;
    } else {
        return false;
    }
};
Room.prototype.hasHostileAttacker = function() {
    var targets = this.find(FIND_HOSTILE_CREEPS, {
        filter: (target) => {
            var hasAttack = false;
            _.forEach(target.body, (part) => {
                if(_.includes([RANGED_ATTACK,ATTACK], part.type)) {
                    hasAttack = true;
                    return false;
                }
            });
            return hasAttack;
        }
    });
    return _.size(targets) > 0;
};
Room.prototype.getContainerCount = function() {
    return _.size(this.find(FIND_STRUCTURES, {
        filter: (target) => target.structureType == STRUCTURE_CONTAINER}));
};
Room.prototype.getTowerCount = function() {
    return _.size(this.find(FIND_MY_STRUCTURES, {
        filter: (target) => target.structureType == STRUCTURE_TOWER}));
};
Room.prototype.findConstructionSites = function(types) {
    if(types == null) {
        return this.find(FIND_MY_CONSTRUCTION_SITES);
    } else {
        return this.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: (target) => {
                return _.includes(types, target.structureType);
            }
        });
    }
};
Room.prototype.findNotFullContainers = function() {
    return this.find(FIND_MY_STRUCTURES, {
        filter: (target) => {
            return target.structureType == STRUCTURE_CONTAINER
                && target.store[RESOURCE_ENERGY] < target.storeCapacity;
        }
    });
};
Room.prototype.isStorageNotFull = function() {
    if(this.storage != null && this.storage.store[RESOURCE_ENERGY] < this.storage.storeCapacity){
        return true;
    } else {
        return false;
    }
};
Room.prototype.isStorageNotEmpty = function() {
    if(this.storage != null && this.storage.store[RESOURCE_ENERGY] > 0){
        return true;
    } else {
        return false;
    }
};
