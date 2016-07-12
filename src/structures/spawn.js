let sh = require('shared');
StructureSpawn.prototype.run = function() {
    let spawnedOrMissing = false;
    _.forEach(Memory.config.rooms, (name) => {
        let room = Game.rooms[name];
        if(room != null && room.isMine()) {
            spawnedOrMissing = this.spawnMissingCreep(name);
            return !spawnedOrMissing;
        }
    });
    if(!spawnedOrMissing) {
        _.forEach(Memory.config.rooms, (name) => {
            let room = Game.rooms[name];
            if(room == null || !room.isMine()) {
                spawnedOrMissing = this.spawnMissingCreep(name);
                return !spawnedOrMissing;
            }
        });
    }
};
StructureSpawn.prototype.spawnMissingCreep = function(name) {
    let expected = this.getExpectedCreeps(name);
    let room = Game.rooms[name];
    if(room != null && room.isMine() && this.doSpawnCreep(name, sh.CREEP_HARVESTER, 1)) {
        return true;
    }
    if(room != null && room.isMine() && this.doSpawnCreep(name, sh.CREEP_FILLER, 1)) {
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
        let harvesters = _.size(_.filter(Game.creeps, (creep) => creep.memory.role == sh.CREEP_HARVESTER && creep.memory.room == name));
        for(let source of room.find(FIND_SOURCES)) {
            if(source.needsHarvester()) {
                harvesters++;
            }
        }
        expected.set(sh.CREEP_HARVESTER, harvesters);
        let containerCount = room.getContainerCount();
        if(containerCount > 0 && !room.isMine()) {
            expected.set(sh.CREEP_TRANSPORTER, Math.min(containerCount, 2));
        }
        if(room.energyCapacityAvailable > 0) {
            if(room.energyCapacityAvailable > 400) {
                expected.set(sh.CREEP_FILLER, 2);
            } else {
                expected.set(sh.CREEP_FILLER, 1);
            }
        }
        if(room.isMine()) {
            if(room.storage != null && room.storage.store[RESOURCE_ENERGY] > 10000) {
                let count = Math.min(2, Math.trunc(room.storage.store[RESOURCE_ENERGY]/10000));
                expected.set(sh.CREEP_UPGRADER, count);
            } else {
                expected.set(sh.CREEP_UPGRADER, 1);
            }
        }
        if(_.size(room.findConstructionSites()) > 0) {
            expected.set(sh.CREEP_BUILDER, 1);
        }
        if((room.isMine() || room.memory.type == sh.ROOM_EXPANSION) && room.getTowerCount() == 0) {
            expected.set(sh.CREEP_REPAIRER, 1);
        }
        if(!room.isMine()) {
            if(room.memory.type == sh.ROOM_EXPANSION) {
                if(room.controller == null || room.controller.reservation == null) {
                    room.memory.needReserve = true;
                } else {
                    if(room.controller.reservation.ticksToEnd < sh.reservationMin) {
                        room.memory.needReserve = true;
                    }
                    if(room.controller.reservation.ticksToEnd > sh.reservationMax) {
                        room.memory.needReserve = false;
                    }
                }
                if(room.hasHurtCreep()) {
                    expected.set(sh.CREEP_HEALER, 1);
                }
                if(room.hasHostileAttacker()) {
                    expected.set(sh.CREEP_WARRIOR, 1);
                    expected.set(sh.CREEP_HEALER, 1);
                    expected.set(sh.CREEP_RANGER, 1);
                }
            }
        }
    } else {
        if(Memory.rooms[name] == null || Memory.rooms[name].type == null) {
            expected.set(sh.CREEP_SCOUT, 1);
        } else if (Memory.rooms[name].type == sh.ROOM_EXPANSION) {
            expected.set(sh.CREEP_REPAIRER, 1);
            Memory.rooms[name].needReserve = true;
        }
    }
    if(Memory.rooms[name].needReserve != null) {
        if(Math.trunc(this.room.energyCapacityAvailable/650) < 2) {
            if(Memory.rooms[name].needReserve) {
                expected.set(sh.CREEP_CAPTURER, 2);
            } else {
                expected.set(sh.CREEP_CAPTURER, 1);
            }
        } else {
            if(Memory.rooms[name].needReserve) {
                expected.set(sh.CREEP_CAPTURER, 1);
            }
        }
    }
    if(Memory.rooms[name].type == sh.ROOM_KEEPER_LAIR) {
        //expected.set(sh.CREEP_WARRIOR, 1);
    }
    return expected;
};
StructureSpawn.prototype.doSpawnCreep = function(name, role, count) {
    let roomCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.room == name);
    if(_.size(roomCreeps) < count) {
        let body = this.chooseBody(role);
        if(this.canCreateCreep(body) == OK) {
            let result = this.createCreep(body, null, {
                role: role,
                room: name
            });
            if(_.isString(result)) {
                // console.log('body: ' + body);
                console.log('Spawning new ' + role + ' for ' + name + ': ' + result);
                return true;
            } else {
                console.log('Spawn error: ' + result);
            }
        } else {
            return true;
        }
    }
    return false;
};
StructureSpawn.prototype.chooseBody = function(role) {
    let totalCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
    let energyCapAvail = this.room.energyCapacityAvailable;
    let body = [];
    let div = 0;
    switch(role) {
        case sh.CREEP_CAPTURER:
            div = Math.min(2, Math.trunc(energyCapAvail/650));
            this.addParts(body, div, CLAIM);
            this.addParts(body, div, MOVE);
            return body;
        case sh.CREEP_FILLER:
        case sh.CREEP_TRANSPORTER:
            div = Math.min(10, Math.trunc(energyCapAvail/100));
            if(totalCreeps == 0) {
                div = 3;
            }
            this.addParts(body, div, CARRY);
            this.addParts(body, div, MOVE);
            return body;
        case sh.CREEP_SCOUT:
            return [MOVE];
        case sh.CREEP_WARRIOR:
            this.addParts(body, 2, TOUGH);
            this.addParts(body, 5, MOVE);
            this.addParts(body, 4, ATTACK);
            body.push(MOVE);
            return body;
        case sh.CREEP_RANGER:
            this.addParts(body, 5, MOVE);
            this.addParts(body, 3, RANGED_ATTACK);
            body.push(MOVE);
            return body;
        case sh.CREEP_HEALER:
            this.addParts(body, 3, MOVE);
            this.addParts(body, 2, HEAL);
            body.push(MOVE);
            return body;
        case sh.CREEP_HARVESTER:
            switch(totalCreeps) {
                case 0:
                    return [WORK,WORK,CARRY,MOVE];
                case 1:
                    return [WORK,WORK,WORK,CARRY,MOVE];
                default: {
                    // optimize creep to harvest
                    let body = [];
                    this.addParts(body, 5, WORK);
                    body.push(CARRY);
                    body.push(MOVE);
                    return body;
                }
            }
        case sh.CREEP_BUILDER:
            body = [WORK,CARRY,CARRY,MOVE,MOVE,MOVE];
            return body;
        case sh.CREEP_UPGRADER:
        case sh.CREEP_REPAIRER:
            this.addParts(body, 5, WORK);
            this.addParts(body, 2, CARRY);
            this.addParts(body, 7, MOVE);
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
