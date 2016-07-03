var _ = require('lodash');
var sh = require('shared');
var s = {
    /** Spawn creeps that are missing **/
    spawnCreeps: function() {
        var spawning = false;
        spawning = s.spawnHarvester();
        if(!spawning) {
            spawning = s.spawnFiller();
        }
        if(!spawning) {
            spawning = s.spawnTransporter();
        }
        if(!spawning) {
            spawning = s.spawnUpgrader();
        }
        if(!spawning) {
            spawning = s.spawnBuilder();
        }
        if(!spawning) {
            spawning = s.spawnRepairer();
        }
        if(!spawning) {
            spawning = s.spawnCapturer();
        }
    },
    spawnCreep: function() {
        var homeRooms = _.filter(Memory.rooms, (mem) => mem.type == sh.ROOM_HOME);
        _.forEach(homeRoom, (mem, room) => {

        });
        var notHomeRooms = _.filter(Memory.rooms, (mem) => mem.type != sh.ROOM_HOME);
    },
    trySpawnCreep: function(room, mem) {
        s.determineExpectedCreeps(room, mem);
        s.checkHarvesters(room);
        s.checkUpgrader
    },
    determineExpectedCreeps: function(room, mem) {
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
    },
    doSpawnCreep: function(role, expected, room) {
        var totalCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
        var roomCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.room == room);
        if(_.size(roomCreeps) < expected) {
            var body = s.chooseBody(role, _.size(totalCreeps), Game.spawns[Memory.config.mainSpawn].room.energyCapacityAvailable);
            if(Game.spawns[Memory.config.mainSpawn].canCreateCreep(body) == OK) {
                var result = Game.spawns[Memory.config.mainSpawn].createCreep(body, null, {
                    role: role,
                    room: room
                });
                if(_.isString(result)) {
                    console.log('Spawning new ' + role + ': ' + result);
                    return true;
                } else {
                    console.log('Spawn error: ' + result);
                }
            }
        }
        return false;
    },
    chooseBody: function(role, totalCreeps, energyCapAvail) {
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
