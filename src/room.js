let _ = require('lodash');
let sh = require('shared');
Room.prototype.run = function() {
    if(this.memory.maxHarvesters == null) {
        let count = 0;
        let sources = this.find(FIND_SOURCES);
        _.forEach(sources, (source) => {
            let tiles = this.lookForAtArea(LOOK_TERRAIN, source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true);
            _.forEach(tiles, (tile) => {
                if(tile.terrain != 'wall') {
                    count++;
                }
            });
        });
        this.memory.maxHarvesters = count;
    }
    if(this.mode == MODE_SIMULATION && !this.memory.test) {
        _.forEach(this.find(FIND_SOURCES), (source) => {
            let vals = PathFinder.search(Game.spawns.Spawn1.pos, {pos: source.pos, range: 1});
            console.log(vals.path);
            _.forEach(vals.path, (val) => {
                this.createConstructionSite(val, STRUCTURE_ROAD);
            });
        });
        this.memory.test = true;
    }
    let spawns = this.find(FIND_MY_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_SPAWN});
    _.forEach(spawns, (spawn) => {
        spawn.run();
    });
    let towers = this.find(FIND_MY_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_TOWER});
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
    let targets = this.find(FIND_HOSTILE_CREEPS, {
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
