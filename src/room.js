let sh = require('shared');
Room.prototype.run = function() {
    if(!this.isMine() && this.memory.type == null) {
        if(this.isKeeperLairRoom()) {
            this.memory.type = sh.ROOM_KEEPER_LAIR;
        } else {
            this.memory.type = sh.ROOM_EXPANSION;
        }
    }
    if(this.mode == MODE_SIMULATION && !this.memory.test) {
        for(let source of this.find(FIND_SOURCES)) {
            let vals = PathFinder.search(Game.spawns.Spawn1.pos, {pos: source.pos, range: 1});
            console.log(vals.path);
            for(let val of vals.path) {
                this.createConstructionSite(val, STRUCTURE_ROAD);
            }
        }
        this.memory.test = true;
    }
    let spawns = this.find(FIND_MY_STRUCTURES, {
        filter: (t) => t.structureType == STRUCTURE_SPAWN});
    for(let spawn of spawns) {
        spawn.run();
    }
    let towers = this.find(FIND_MY_STRUCTURES, {
        filter: (t) => t.structureType == STRUCTURE_TOWER});
    for(let tower of towers) {
        tower.run();
    }
    let links = this.find(FIND_MY_STRUCTURES, {
        filter: (t) => t.structureType == STRUCTURE_LINK});
    for(let link of links) {
        link.run();
    }
};
Room.prototype.isMine = function() {
    return this.controller != null && this.controller.my;
};
Room.prototype.isKeeperLairRoom = function() {
    return !_.isEmpty(this.find(FIND_STRUCTURES, {
        filter: (t) => t.structureType == STRUCTURE_KEEPER_LAIR}));
};
Room.prototype.hasHostileAttacker = function() {
    let targets = this.find(FIND_HOSTILE_CREEPS, {
        filter: (t) => {
            for(let part of t.body) {
                if(sh.ATTACKER_PARTS.has(part.type)) {
                    return true;
                }
            }
            return false;
        }
    });
    return !_.isEmpty(targets);
};
Room.prototype.hasHurtCreep = function() {
    return !_.isEmpty(this.find(FIND_MY_CREEPS, {
        filter: (t) => t.hits < t.hitsMax}));
};
Room.prototype.getContainerCount = function() {
    return _.size(this.find(FIND_STRUCTURES, {
        filter: (t) => t.structureType == STRUCTURE_CONTAINER}));
};
Room.prototype.hasTower = function() {
    return !_.isEmpty(this.find(FIND_MY_STRUCTURES, {
        filter: (t) => t.structureType == STRUCTURE_TOWER}));
};
Room.prototype.hasSpawn = function() {
    return !_.isEmpty(this.find(FIND_MY_STRUCTURES, {
        filter: (t) => t.structureType == STRUCTURE_SPAWN}));
};
Room.prototype.findConstructionSites = function(types) {
    if(types == null) {
        return this.find(FIND_MY_CONSTRUCTION_SITES);
    } else {
        return this.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: (t) => {
                return _.includes(types, t.structureType);
            }
        });
    }
};
Room.prototype.findNotFullContainers = function() {
    return this.find(FIND_STRUCTURES, {
        filter: (t) => {
            return t.structureType == STRUCTURE_CONTAINER
                && t.store[RESOURCE_ENERGY] < t.storeCapacity;
        }
    });
};
Room.prototype.isStorageNotFull = function() {
    return this.storage != null
        && this.storage.store[RESOURCE_ENERGY] < this.storage.storeCapacity;
};
Room.prototype.isStorageNotEmpty = function() {
    return this.storage != null && this.storage.store[RESOURCE_ENERGY] > 0;
};
Room.prototype.findSourcesForHarvester = function() {
    return this.find(FIND_SOURCES, {filter: (t) => t.needsHarvester() && !_.includes(Memory.config.blacklist, t.id)});
};
Room.prototype.checkNeedHarvester = function() {
    return !_.isEmpty(this.findSourcesForHarvester());
};
