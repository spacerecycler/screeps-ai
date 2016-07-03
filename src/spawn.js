var _ = require('lodash');
var sh = require('shared');
StructureSpawn.prototype.run = function() {
    var spawnedOrMissing = false;
    _.forEach(Memory.rooms, (mem, room) => {
        if(mem.type == sh.ROOM_HOME) {
            spawnedOrMissing = this.trySpawnCreep(room, mem);
            return !spawnedOrMissing;
        }
    });
    if(!spawnedOrMissing) {
        _.forEach(Memory.rooms, (mem, room) => {
            if(mem.type != sh.ROOM_HOME) {
                spawnedOrMissing = this.trySpawnCreep(room, mem);
                return !spawnedOrMissing;
            }
        });
    }
};
StructureSpawn.prototype.trySpawnCreep = function(room, mem) {
    var expected = this.getExpectedCreeps(room, mem);
    return this.doSpawnCreep(room, expected);
};
StructureSpawn.prototype.getExpectedCreeps = function(room, mem) {
    var expected = {};
    if(Game.rooms[room] != null) {
        var containerCount = Game.rooms[room].getContainerCount();
        if(containerCount > 0) {
            expected[sh.CREEP_HARVESTER] = Math.min(containerCount, mem.maxHarvesters);
            if(mem.type == sh.ROOM_EXPANSION) {
                expected[sh.CREEP_TRANSPORTER] = Math.min(containerCount, 2);
            }
        } else {
            var structureCount = _.size(Game.rooms[room].find(FIND_MY_STRUCTURES));
            if(structureCount > 0) {
                expected[sh.CREEP_HARVESTER] = 2;
            }
        }
        if(Game.rooms[room].energyCapacityAvailable > 0) {
            expected[sh.CREEP_FILLER] = Math.ceil(Game.rooms[room].energyCapacityAvailable/400);
        }
        if(mem.type == sh.ROOM_HOME) {
            expected[sh.CREEP_UPGRADER] = 1;
        }
        if(room == Game.spawns[Memory.config.mainSpawn].room.name && _.size(Game.constructionSites) > 0) {
            expected[sh.CREEP_BUILDER] = 1;
        }
        if(Game.rooms[room].getTowerCount() == 0) {
            expected[sh.CREEP_REPAIRER] = 1;
        }
        if(mem.type == sh.ROOM_EXPANSION) {
            if(Game.rooms[room].controller == null || Game.rooms[room].controller.reservation == null) {
                mem.needReserve = true;
            } else {
                if(Game.rooms[room].controller.reservation.ticksToEnd < sh.reservationMin) {
                    mem.needReserve = true;
                }
                if(Game.rooms[room].controller.reservation.ticksToEnd > sh.reservationMax) {
                    mem.needReserve = false;
                }
            }
        }
    } else {
        expected[sh.CREEP_REPAIRER] = 1;
        if(mem.type == sh.ROOM_EXPANSION) {
            mem.needReserve = true;
        }
    }
    if(mem.type == sh.ROOM_EXPANSION) {
        if(mem.needReserve) {
            expected[sh.CREEP_CAPTURER] = 2;
        } else {
            expected[sh.CREEP_CAPTURER] = 1;
        }
    }
    return expected;
};
StructureSpawn.prototype.doSpawnCreep = function(room, expected) {
    var spawnedOrMissing = false;
    _.forEach(expected, (count, role) => {
        var roomCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.room == room);
        if(_.size(roomCreeps) < count) {
            var body = this.chooseBody(role);
            if(this.canCreateCreep(body) == OK) {
                var result = this.createCreep(body, null, {
                    role: role,
                    room: room
                });
                if(_.isString(result)) {
                    console.log('Spawning new ' + role + ' for ' + room + ': ' + result);
                    spawnedOrMissing = true;
                    return false;
                } else {
                    console.log('Spawn error: ' + result);
                }
            } else {
                spawnedOrMissing = true;
                return false;
            }
        }
    });
    return spawnedOrMissing;
};
StructureSpawn.prototype.chooseBody = function(role) {
    var totalCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
    var energyCapAvail = this.room.energyCapacityAvailable;
    var body = [];
    if(role == sh.CREEP_CAPTURER) {
        return [CLAIM,MOVE,MOVE];
    }
    if(role == sh.CREEP_FILLER || role == sh.CREEP_TRANSPORTER) {
        if(totalCreeps == 0) {
            return [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
        }
        var div = Math.trunc(energyCapAvail/100);
        _.times(div, () => {
            body.push(CARRY);
            body.push(MOVE);
        });
        return body;
    }
    if(role == sh.CREEP_HARVESTER && totalCreeps == 0) {
        return [WORK,WORK,CARRY,MOVE];
    }
    var parts50 = energyCapAvail/50;
    // number of 50 cost parts * 5/8 /2 = num work parts
    var numWorkParts = Math.ceil(parts50*5 /16);
    var remainingParts = parts50 - numWorkParts*2;
    _.times(numWorkParts, () => body.push(WORK));
    _.times(Math.trunc(remainingParts/2), () => {
        body.push(CARRY);
        body.push(MOVE);
    });
    if(remainingParts%2 > 0) {
        body.push(MOVE);
    }
    return body;
};
