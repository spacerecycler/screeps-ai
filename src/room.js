'use strict';
let sh = require('shared');
Room.prototype.run = function() {
    let spawns = this.find(FIND_MY_STRUCTURES, {
        filter: (t) => t.structureType == STRUCTURE_SPAWN});
    if(!_.isEmpty(spawns) && _.isEmpty(this.findIdleFlags())) {
        let result = this.createFlag(spawns[0].pos.x, spawns[0].pos.y-3,
            'Idle' + this.name);
        if(_.isString(result)) {
            Memory.flags[result] = {type: sh.FLAG_IDLE};
        } else {
            console.error('error creating flag');
        }
    }
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
    // if(this.isMine()) {
    //     let road = _.head(this.find(FIND_STRUCTURES, {filter: (s) => {
    //         return s.structureType == STRUCTURE_ROAD
    //             && s.pos.lookFor(LOOK_TERRAIN) == 'plain';
    //     }}));
    //     if(road != null) {
    //         road.destroy();
    //     }
    // }
};
Room.prototype.setupMem = function() {
    if(!this.isMine() && this.memory.type == null) {
        if(this.isKeeperLairRoom()) {
            this.memory.type = sh.ROOM_KEEPER_LAIR;
        } else {
            this.memory.type = sh.ROOM_EXPANSION;
        }
    }
    if(this.controller != null) {
        this.memory.controllerReserveSpots =
            this.controller.countReserveSpots();
    }
    if(this.memory.type == sh.ROOM_EXPANSION && this.controller != null) {
        if(this.controller.reservation == null) {
            this.memory.needReserve = true;
        } else {
            if(this.controller.reservation.ticksToEnd <
                sh.RESERVATION_MIN) {
                this.memory.needReserve = true;
            }
            if(this.controller.reservation.ticksToEnd >
                sh.RESERVATION_MAX) {
                this.memory.needReserve = false;
            }
        }
    }
    if(this.memory.type == sh.ROOM_EXPANSION
        && this.memory.shouldClaim == null) {
        this.memory.shouldClaim = true;
    }
};
Room.prototype.needsRecovery = function() {
    let roomCreeps = _.filter(Game.creeps, (creep) => {
        return _.includes([sh.CREEP_HARVESTER,sh.CREEP_FILLER],
            Memory.creeps[creep.name].role)
            && Memory.creeps[creep.name].room == this.name;
    });
    return _.isEmpty(roomCreeps);
};
Room.prototype.isMine = function() {
    return this.controller != null && this.controller.my;
};
Room.prototype.isKeeperLairRoom = function() {
    return !_.isEmpty(this.find(FIND_STRUCTURES, {
        filter: (t) => t.structureType == STRUCTURE_KEEPER_LAIR}));
};
Room.prototype.hasHostileAttacker = function() {
    if(this.hostileAttackerVar == null) {
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
        this.hostileAttackerVar = !_.isEmpty(targets);
    }
    return this.hostileAttackerVar;
};
Room.prototype.hasHurtCreep = function() {
    if(this.hurtCreepVar == null) {
        this.hurtCreepVar = !_.isEmpty(this.find(FIND_MY_CREEPS, {
            filter: (t) => t.hits < t.hitsMax}));
    }
    return this.hurtCreepVar;
};
Room.prototype.getContainerCount = function() {
    if(this.containerCount == null) {
        this.containerCount = _.size(this.find(FIND_STRUCTURES, {
            filter: (t) => {
                return t.structureType == STRUCTURE_CONTAINER
                    && !_.includes(Memory.config.blacklist[this.name], t.id)
                    && !t.isHostileNearby();
            }
        }));
    }
    return this.containerCount;
};
Room.prototype.hasTower = function() {
    if(this.hasTowerVar == null) {
        this.hasTowerVar = !_.isEmpty(this.find(FIND_MY_STRUCTURES, {
            filter: (t) => t.structureType == STRUCTURE_TOWER}));
    }
    return this.hasTowerVar;
};
Room.prototype.hasSpawn = function() {
    if(this.hasSpawnVar == null) {
        this.hasSpawnVar = !_.isEmpty(this.find(FIND_MY_STRUCTURES, {
            filter: (t) => t.structureType == STRUCTURE_SPAWN}));
    }
    return this.hasSpawnVar;
};
Room.prototype.findConstructionSites = function(types) {
    if(types == null) {
        return this.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: (t) => !t.isHostileNearby()
        });
    } else {
        return this.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: (t) => {
                return _.includes(types, t.structureType)
                    && !t.isHostileNearby();
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
Room.prototype.findNotEmptyContainers = function() {
    return this.find(FIND_STRUCTURES, {
        filter: (t) => {
            return t.structureType == STRUCTURE_CONTAINER
                && t.store[RESOURCE_ENERGY] > 0;
        }
    });
};
Room.prototype.findNotEmptyLinks = function() {
    return this.find(FIND_MY_STRUCTURES, {
        filter: (t) => {
            return t.structureType == STRUCTURE_LINK
                && t.energy > 0
                && !Memory.links[t.id].nearSource;
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
Room.prototype.findSourcesForTank = function() {
    return this.find(FIND_SOURCES, {filter: (t) =>
        !_.includes(Memory.config.blacklist[this.name], t.id)});
};
Room.prototype.findSourcesForHarvester = function() {
    return this.find(FIND_SOURCES, {filter: (t) => t.needsHarvester()
        && !_.includes(Memory.config.blacklist[this.name], t.id)});
};
Room.prototype.checkNeedHarvester = function() {
    return !_.isEmpty(this.findSourcesForHarvester());
};
Room.prototype.findIdleFlags = function() {
    return this.find(FIND_FLAGS, {filter: (f) => f.isIdle()});
};
