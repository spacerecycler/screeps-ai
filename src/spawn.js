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
    let spawnedOrMissing = false;
    let room = Game.rooms[name];
    if(room != null && room.isMine()) {
        spawnedOrMissing = this.doSpawnCreep(name, sh.CREEP_HARVESTER, 1);
        if(!spawnedOrMissing) {
            spawnedOrMissing = this.doSpawnCreep(name, sh.CREEP_FILLER, 1);
        }
    }
    if(!spawnedOrMissing) {
        _.forEach(expected, (count, role) => {
            spawnedOrMissing = this.doSpawnCreep(name, role, count);
            return !spawnedOrMissing;
        });
    }
    return spawnedOrMissing;
};
StructureSpawn.prototype.getExpectedCreeps = function(name) {
    let expected = {};
    let room = Game.rooms[name];
    if(room != null) {
        let containerCount = room.getContainerCount();
        if(room.storage != null) {
            expected[sh.CREEP_HARVESTER] = room.memory.maxHarvesters;
        } else if(containerCount > 0) {
            expected[sh.CREEP_HARVESTER] = Math.min(containerCount, room.memory.maxHarvesters);
            if(!room.isMine()) {
                expected[sh.CREEP_TRANSPORTER] = Math.min(containerCount, 2);
            }
        } else {
            let structureCount = _.size(room.find(FIND_MY_STRUCTURES));
            if(structureCount > 0) {
                expected[sh.CREEP_HARVESTER] = 2;
            }
        }
        if(room.energyCapacityAvailable > 0) {
            if(room.energyCapacityAvailable > 400) {
                expected[sh.CREEP_FILLER] = 2;
            } else {
                expected[sh.CREEP_FILLER] = 1;
            }
        }
        if(room.isMine()) {
            if(room.storage != null && room.storage.store[RESOURCE_ENERGY] > 10000) {
                expected[sh.CREEP_UPGRADER] = 2;
            } else {
                expected[sh.CREEP_UPGRADER] = 1;
            }
        }
        if(_.size(room.findConstructionSites()) > 0) {
            expected[sh.CREEP_BUILDER] = 1;
        }
        if(room.memory.type == sh.ROOM_EXPANSION || room.getTowerCount() == 0) {
            expected[sh.CREEP_REPAIRER] = 1;
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
            }
        }
    } else {
        if(Memory.rooms[name] == null || Memory.rooms[name].type == null) {
            expected[sh.CREEP_SCOUT] = 1;
        } else if (Memory.rooms[name].type == sh.ROOM_EXPANSION) {
            expected[sh.CREEP_REPAIRER] = 1;
            Memory.rooms[name].needReserve = true;
        }
    }
    if(Memory.rooms[name].needReserve != null) {
        if(Math.trunc(this.room.energyCapacityAvailable/650) < 2) {
            if(Memory.rooms[name].needReserve) {
                expected[sh.CREEP_CAPTURER] = 2;
            } else {
                expected[sh.CREEP_CAPTURER] = 1;
            }
        } else {
            if(Memory.rooms[name].needReserve) {
                expected[sh.CREEP_CAPTURER] = 1;
            }
        }
    }
    if(Memory.rooms[name].type == sh.ROOM_KEEPER_LAIR) {
        expected[sh.CREEP_DEFENDER] = 1;
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
    if(role == sh.CREEP_CAPTURER) {
        let body = [];
        _.times(Math.trunc(energyCapAvail/650), () => {
            body.push(CLAIM,MOVE);
        });
        return body;
    }
    if(role == sh.CREEP_FILLER || role == sh.CREEP_TRANSPORTER) {
        if(role == sh.CREEP_FILLER && totalCreeps == 0) {
            return [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
        }
        let body = [];
        let div = Math.trunc(energyCapAvail/100);
        _.times(div, () => {
            body.push(CARRY,MOVE);
        });
        return body;
    }
    if(role == sh.CREEP_HARVESTER && totalCreeps == 0) {
        return [WORK,WORK,CARRY,MOVE];
    }
    if(role == sh.CREEP_SCOUT) {
        return [MOVE];
    }
    if(role == sh.CREEP_DEFENDER) {
        let body = [];
        _.times(Math.trunc(energyCapAvail/150), () => {
            body.push(ATTACK,TOUGH,TOUGH,MOVE);
        });
    }
    let body = [];
    let div = energyCapAvail/50;
    // number of 50 cost parts * 5/8 /2 = num work parts
    let numWorkParts = Math.ceil(div*5 /16);
    let remainingParts = div - numWorkParts*2;
    _.times(numWorkParts, () => body.push(WORK));
    _.times(Math.trunc(remainingParts/2), () => {
        body.push(CARRY,MOVE);
    });
    if(remainingParts%2 > 0) {
        body.push(MOVE);
    }
    return body;
};
