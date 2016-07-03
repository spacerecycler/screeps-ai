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
    spawnHarvester: function() {
        var spawned = false;
        _.forEach(Memory.rooms, (mem, room) =>{
            if(Game.rooms[room] != null) {
                var containerCount = sh.getContainerCount(Game.rooms[room]);
                if(containerCount > 0) {
                    if(s.doSpawnCreep(sh.CREEP_HARVESTER, Math.min(containerCount, mem.maxHarvesters), room)) {
                        spawned = true;
                        return false;
                    }
                } else {
                    var structureCount = _.size(Game.rooms[room].find(FIND_MY_STRUCTURES));
                    if(structureCount > 0) {
                        if(s.doSpawnCreep(sh.CREEP_HARVESTER, 2, room)) {
                            spawned = true;
                            return false;
                        }
                    }
                }
            }
        });
        return spawned;
    },
    spawnUpgrader: function() {
        var spawned = false;
        _.forEach(Memory.rooms, (mem, room) =>{
            if(mem.type == sh.ROOM_HOME) {
                if(s.doSpawnCreep(sh.CREEP_UPGRADER, 1, room)) {
                    spawned = true;
                    return false;
                }
            }
        });
        return spawned;
    },
    spawnBuilder: function() {
        if(_.size(Game.constructionSites) > 0) {
            return s.doSpawnCreep(sh.CREEP_BUILDER, 1, Game.spawns[Memory.config.mainSpawn].room.name);
        }
        return false;
    },
    spawnRepairer: function() {
        var spawned = false;
        _.forEach(Memory.rooms, (mem, room) =>{
            if(Game.rooms[room] != null) {
                if(sh.getTowerCount(Game.rooms[room]) > 0) {
                    return;
                }
            }
            if(s.doSpawnCreep(sh.CREEP_REPAIRER, 1, room)) {
                spawned = true;
                return false;
            }
        });
        return spawned;
    },
    spawnCapturer: function() {
        var spawned = false;
        _.forEach(Memory.rooms, (mem, room) =>{
            if(mem.type == sh.ROOM_EXPANSION) {
                if(Game.rooms[room].controller.reservation == null) {
                    mem.needReserve = true;
                } else {
                    if(Game.rooms[room].controller.reservation.ticksToEnd < sh.reservationMin) {
                        mem.needReserve = true;
                    }
                    if(Game.rooms[room].controller.reservation.ticksToEnd > sh.reservationMax) {
                        mem.needReserve = false;
                    }
                }
                var count = 1;
                if(mem.needReserve) {
                    count = 2;
                }
                if(s.doSpawnCreep(sh.CREEP_CAPTURER, count, room)) {
                    spawned = true;
                    return false;
                }
            }
        });
        return spawned;
    },
    spawnFiller: function() {
        var spawned = false;
        _.forEach(Memory.rooms, (mem, room) =>{
            if(Game.rooms[room] == null) {
                return;
            }
            if(Game.rooms[room].energyCapacityAvailable > 0) {
                var count = Math.trunc(Game.rooms[room].energyCapacityAvailable/400) + 1;
                if(s.doSpawnCreep(sh.CREEP_FILLER, count, room)) {
                    spawned = true;
                    return false;
                }
            }
        });
        return spawned;
    },
    spawnTransporter: function() {
        var spawned = false;
        _.forEach(Memory.rooms, (mem, room) => {
            if(Game.rooms[room] == null) {
                return;
            }
            if(mem.type == sh.ROOM_EXPANSION) {
                var containerCount = sh.getContainerCount(Game.rooms[room]);
                if(containerCount > 0) {
                    if(s.doSpawnCreep(sh.CREEP_TRANSPORTER, Math.min(containerCount, 2), room)) {
                        spawned = true;
                        return false;
                    }
                }
            }
        });
        return spawned;
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
