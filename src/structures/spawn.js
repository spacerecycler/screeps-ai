'use strict';
let sh = require('shared');
StructureSpawn.prototype.run = function() {
    if(this.room.mode == MODE_SIMULATION && !this.memory.roadsToSources) {
        for(let source of this.room.find(FIND_SOURCES)) {
            let vals = PathFinder.search(this.pos, {pos: source.pos, range: 1});
            for(let val of vals.path) {
                this.room.createConstructionSite(val, STRUCTURE_ROAD);
            }
        }
        this.memory.roadsToSources = true;
    }
    let spawnedOrMissing = false;
    spawnedOrMissing = this.spawnMissingCreep(this.room.name);
    if(!spawnedOrMissing) {
        _.forEach(Memory.config.rooms, (name) => {
            let room = Game.rooms[name];
            if(name != this.room.name && room != null && room.isMine()
                && this.room.isNearTo(room)) {
                spawnedOrMissing = this.spawnMissingCreep(name);
                return !spawnedOrMissing;
            }
        });
    }
    if(!spawnedOrMissing) {
        _.forEach(Memory.config.rooms, (name) => {
            let room = Game.rooms[name];
            if((room == null || !room.isMine()) && this.room.isNearTo(name)) {
                spawnedOrMissing = this.spawnMissingCreep(name);
                return !spawnedOrMissing;
            }
        });
    }
};
StructureSpawn.prototype.spawnMissingCreep = function(name) {
    let expected = this.getExpectedCreeps(name);
    let room = Game.rooms[name];
    if(room != null && room.isMine()
        && this.doSpawnCreep(name, sh.CREEP_HARVESTER, 1)) {
        return true;
    }
    if(room != null && room.isMine()
        && this.doSpawnCreep(name, sh.CREEP_FILLER, 1)) {
        return true;
    }
    for(let [role,count] of expected) {
        if(this.doSpawnCreep(name, role, count)) {
            return true;
        }
    }
    return false;
};
StructureSpawn.prototype.getExpectedCreeps = function(name) {
    let expected = new Map();
    let room = Game.rooms[name];
    if(room != null) {
        if(_.isEmpty(_.filter(Game.creeps, (creep) => {
            return Memory.creeps[creep.name].role == sh.CREEP_HARVESTER
                && Memory.creeps[creep.name].room == name
                && Memory.creeps[creep.name].targetSource == null;}))) {
            let harvesters = _.size(_.filter(Game.creeps, (creep) => {
                return creep.memory.role == sh.CREEP_HARVESTER
                    && creep.memory.room == name;
            }));
            if(room.checkNeedHarvester()) {
                harvesters++;
            }
            expected.set(sh.CREEP_HARVESTER, harvesters);
        }
        let containerCount = room.getContainerCount();
        if(containerCount > 0 && !room.isMine()) {
            expected.set(sh.CREEP_TRANSPORTER, containerCount * 2);
        }
        if(room.energyCapacityAvailable > 0) {
            if(room.energyCapacityAvailable > 400) {
                expected.set(sh.CREEP_FILLER, 2);
            } else {
                expected.set(sh.CREEP_FILLER, 1);
            }
        }
        if(room.isMine()) {
            if(room.storage != null) {
                let count = Math.max(1,
                    Math.ceil(room.storage.store[RESOURCE_ENERGY]/100000));
                expected.set(sh.CREEP_UPGRADER, count);
            } else {
                expected.set(sh.CREEP_UPGRADER,
                    Math.max(1, room.getContainerCount()));
            }
            if(room.storage != null) {
                if(!_.isEmpty(room.storage.pos.findInRange(FIND_MY_STRUCTURES,
                    2, {filter: (t) => t.structureType == STRUCTURE_TOWER}))) {
                    expected.set(sh.CREEP_TRANSFER, 1);
                }
            }
        }
        let numConstructionSites = _.size(room.findConstructionSites());
        if(numConstructionSites > 1) {
            expected.set(sh.CREEP_BUILDER, 2);
        } else if(numConstructionSites > 0) {
            expected.set(sh.CREEP_BUILDER, 1);
        }
        if((room.isMine() || room.memory.type == sh.ROOM_EXPANSION)
            && !room.hasTower()) {
            expected.set(sh.CREEP_REPAIRER, 1);
            if(room.hasHurtCreep()) {
                expected.set(sh.CREEP_HEALER, 1);
            }
            if(room.hasHostileAttacker()) {
                expected.set(sh.CREEP_WARRIOR, 1);
                expected.set(sh.CREEP_HEALER, 1);
                expected.set(sh.CREEP_RANGER, 1);
            }
        }
    } else {
        if(Memory.rooms[name].type == null) {
            expected.set(sh.CREEP_SCOUT, 1);
        } else if (Memory.rooms[name].type == sh.ROOM_EXPANSION) {
            expected.set(sh.CREEP_REPAIRER, 1);
        }
    }
    if(Memory.rooms[name].needReserve != null) {
        let num = (3 - Math.min(2,
            Math.trunc(this.room.energyCapacityAvailable/650))) % 3;
        if(Memory.rooms[name].controllerReserveSpots == 1) {
            num = 1;
        }
        if(Memory.config.canClaim) {
            expected.set(sh.CREEP_CAPTURER, 1);
        } else {
            if(Memory.rooms[name].needReserve) {
                expected.set(sh.CREEP_CAPTURER, num);
            } else {
                expected.set(sh.CREEP_CAPTURER, num-1);
            }
        }
    }
    if(Memory.rooms[name].type == sh.ROOM_KEEPER_LAIR) {
        if(room != null && room.getContainerCount() > 0) {
            expected.set(sh.CREEP_REPAIRER, 1);
        }
        // expected.set(sh.CREEP_TANK, 1);
        expected.set(sh.CREEP_HEALER, 1);
        // expected.set(sh.CREEP_WARRIOR, 4);
        expected.set(sh.CREEP_RANGER, 4);
    }
    return expected;
};
StructureSpawn.prototype.doSpawnCreep = function(name, role, count) {
    let roomCreeps = _.filter(Game.creeps, (creep) => {
        return Memory.creeps[creep.name].role == role
            && Memory.creeps[creep.name].room == name;
    });
    if(_.size(roomCreeps) < count) {
        let body = this.chooseBody(role, name);
        if(this.canCreateCreep(body) == OK) {
            let result = this.createCreep(body, null, {
                role: role,
                room: name
            });
            if(_.isString(result)) {
                // console.log('body: ' + body);
                console.log(this.name + ' Spawning new ' + role + ' for ' +
                    name + ': ' + result);
                return true;
            } else {
                console.log(this.name + ' Spawn error: ' + result);
            }
        } else {
            return true;
        }
    }
    return false;
};
StructureSpawn.prototype.chooseBody = function(role, name) {
    let energyCapAvail = this.room.energyCapacityAvailable;
    let body = [];
    let div = 0;
    let numCarry = 0;
    let room = Game.rooms[name];
    switch(role) {
        case sh.CREEP_CAPTURER:
            div = Math.min(2, Math.trunc(energyCapAvail/650));
            if(Memory.rooms[name].controllerReserveSpots == 1) {
                div = 2;
            }
            this.addParts(body, div, CLAIM);
            this.addParts(body, div, MOVE);
            return body;
        case sh.CREEP_FILLER:
            div = Math.min(5, Math.trunc(energyCapAvail/100));
            if(this.room.name == name && room.needsRecovery()) {
                div = 3;
            }
            this.addParts(body, div, CARRY);
            this.addParts(body, div, MOVE);
            return body;
        case sh.CREEP_TRANSPORTER:
            div = Math.min(10, Math.trunc(energyCapAvail/100));
            this.addParts(body, div, CARRY);
            this.addParts(body, div, MOVE);
            return body;
        case sh.CREEP_TRANSFER:
            return [CARRY,MOVE];
        case sh.CREEP_SCOUT:
            return [MOVE];
        case sh.CREEP_WARRIOR:
            this.addParts(body, 2, TOUGH);
            this.addParts(body, 5, MOVE);
            this.addParts(body, 4, ATTACK);
            body.push(MOVE);
            return body;
        case sh.CREEP_RANGER:
            this.addParts(body, 2, TOUGH);
            this.addParts(body, 4, MOVE);
            this.addParts(body, 3, RANGED_ATTACK);
            body.push(MOVE);
            return body;
        case sh.CREEP_HEALER:
            this.addParts(body, 1, TOUGH);
            this.addParts(body, 2, MOVE);
            this.addParts(body, 2, HEAL);
            body.push(MOVE);
            return body;
        case sh.CREEP_TANK:
            this.addParts(body, 5, TOUGH);
            this.addParts(body, 6, MOVE);
            body.push(ATTACK);
            return body;
        case sh.CREEP_HARVESTER:
            if(this.room.name == name) {
                if(room.needsRecovery()) {
                    this.addParts(body, 2, WORK);
                    this.addParts(body, 1, MOVE);
                } else {
                    div = Math.min(5, Math.trunc((energyCapAvail-100)/100));
                    this.addParts(body, div, WORK);
                    body.push(MOVE);
                }
            } else {
                let max = 5;
                if(Memory.rooms[name].type == sh.ROOM_KEEPER_LAIR) {
                    max = 7;
                }
                div = Math.min(max, Math.trunc((energyCapAvail-50)/150));
                this.addParts(body, div, WORK);
                this.addParts(body, div, MOVE);
            }
            body.push(CARRY);
            return body;
        case sh.CREEP_BUILDER:
            if(energyCapAvail == 300) {
                return [WORK,CARRY,CARRY,MOVE,MOVE];
            } else {
                return [WORK,CARRY,CARRY,MOVE,MOVE,MOVE];
            }
        case sh.CREEP_UPGRADER:
        case sh.CREEP_REPAIRER:
            numCarry = 1;
            if(energyCapAvail >= 500) {
                numCarry = 2;
            }
            div = Math.min(5, Math.trunc((energyCapAvail-numCarry*100)/150));
            this.addParts(body, div, WORK);
            this.addParts(body, div, MOVE);
            this.addParts(body, numCarry, CARRY);
            this.addParts(body, numCarry, MOVE);
            return body;
        default:
            return body;
    }
};
StructureSpawn.prototype.addParts = function(body, times, part) {
    _.times(times, () => {
        body.push(part);
    });
};
