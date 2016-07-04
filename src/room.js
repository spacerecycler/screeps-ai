var _ = require('lodash');
Room.prototype.run = function() {
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
