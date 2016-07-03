var _ = require('lodash');
var sh = require('shared');
var s = {
    /** Spawn creeps that are missing **/
    spawnCreep: function() {
        var spawned = false;
        _.forEach(Memory.rooms, (mem, room) => {
            if(mem.type == sh.ROOM_HOME) {
                console.log("mem: " + mem + " room: " + room);
                spawned = s.trySpawnCreep(room, mem);
                return !spawned;
            }
        });
        _.forEach(Memory.rooms, (mem, room) => {
            if(mem.type != sh.ROOM_HOME) {
                spawned = s.trySpawnCreep(room, mem);
                return !spawned;
            }
        });
    },
    trySpawnCreep: function(room, mem) {
        var expected = s.getExpectedCreeps(room, mem);
        _.forEach(expected, (count, role) => {
            console.log("role: " + role + " count: " + count);
        });
        return s.doSpawnCreep(room, expected);
    },
    getExpectedCreeps: function(room, mem) {
        var expected = {};
        if(Game.rooms[room] != null) {
            var containerCount = sh.getContainerCount(Game.rooms[room]);
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
                expected[sh.CREEP_FILLER] = Math.trunc(Game.rooms[room].energyCapacityAvailable/400) + 1;
            }
            if(mem.type == sh.ROOM_HOME) {
                expected[sh.CREEP_UPGRADER] = 1;
            }
            if(room == Game.spawns[Memory.config.mainSpawn].room.name && _.size(Game.constructionSites) > 0) {
                expected[sh.CREEP_BUILDER] = 1;
            }
            if(sh.getTowerCount(Game.rooms[room]) == 0) {
                expected[sh.CREEP_REPAIRER] = 1;
            }
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
        } else {
            expected[sh.CREEP_REPAIRER] = 1;
            mem.needReserve = true;
        }
        if(mem.needReserve) {
            expected[sh.CREEP_CAPTURER] = 2;
        } else {
            expected[sh.CREEP_CAPTURER] = 1;
        }
        return expected;
    },
    doSpawnCreep: function(room, expected) {
        var spawned = false;
        _.forEach(expected, (count, role) => {
            var roomCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.room == room);
            if(_.size(roomCreeps) < count) {
                var body = s.chooseBody(role);
                if(Game.spawns[Memory.config.mainSpawn].canCreateCreep(body) == OK) {
                    var result = Game.spawns[Memory.config.mainSpawn].createCreep(body, null, {
                        role: role,
                        room: room
                    });
                    if(_.isString(result)) {
                        console.log('Spawning new ' + role + ' for ' + room + ': ' + result);
                        spawned = true;
                        return false;
                    } else {
                        console.log('Spawn error: ' + result);
                    }
                }
            }
        });
        return spawned;
    },
    chooseBody: function(role) {
        var totalCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
        var energyCapAvail = Game.spawns[Memory.config.mainSpawn].room.energyCapacityAvailable;
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
    }
};
module.exports = s;
