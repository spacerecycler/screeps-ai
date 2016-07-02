var _ = require('lodash');
var c = require('config');
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
        _.forEach(c.rooms, (room) =>{
            if(Game.rooms[room] != null) {
                var containerCount = _.size(Game.rooms[room].find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER;
                    }
                }));
                if(containerCount > 0) {
                    var count = 1;
                    if(containerCount > 2) {
                        count++;
                    }
                    if(s.doSpawnCreep(sh.CREEP_HARVESTER, count, room)) {
                        spawned = true;
                        return false;
                    }
                }
            }
            return true;
        });
        return spawned;
    },
    spawnUpgrader: function() {
        return s.doSpawnCreep(sh.CREEP_UPGRADER, 1, Game.spawns[c.mainSpawn].room.name);
    },
    spawnBuilder: function() {
        if(_.size(Game.constructionSites) > 0) {
            return s.doSpawnCreep(sh.CREEP_BUILDER, 1, Game.spawns[c.mainSpawn].room.name);
        }
        return false;
    },
    spawnRepairer: function() {
        var spawned = false;
        _.forEach(c.rooms, (room) =>{
            if(Game.rooms[room] != null) {
                if(_.size(Game.rooms[room].find(FIND_MY_STRUCTURES, {filter: (structure) => {return structure.structureType == STRUCTURE_TOWER;}})) > 0) {
                    return true;
                }
            }
            if(s.doSpawnCreep(sh.CREEP_REPAIRER, 1, room)) {
                spawned = true;
                return false;
            }
            return true;
        });
        return spawned;
    },
    spawnCapturer: function() {
        if(Game.rooms[c.expansion].controller.reservation.ticksToEnd < 500) {
            Game.rooms[c.expansion].memory.needReserve = true;
        }
        if(Game.rooms[c.expansion].controller.reservation.ticksToEnd > 1500) {
            Game.rooms[c.expansion].memory.needReserve = false;
        }
        var count = 1;
        if(Game.rooms[c.expansion].memory.needReserve) {
            count = 2;
        }
        return s.doSpawnCreep(sh.CREEP_CAPTURER, count, c.expansion);
    },
    spawnFiller: function() {
        var spawned = false;
        _.forEach(c.rooms, (room) =>{
            var count = 0;
            if(Game.rooms[room] == null) {
                return true;
            }
            if(Game.rooms[room].energyCapacityAvailable > 0) {
                count++;
            }
            if(Game.rooms[room].energyCapacityAvailable > 400) {
                count++;
            }
            if(count > 0) {
                if(s.doSpawnCreep(sh.CREEP_FILLER, count, room)) {
                    spawned = true;
                    return false;
                }
            }
            return true;
        });
        return spawned;
    },
    doSpawnCreep: function(name, expected, assignedRoom) {
        var totalCreeps = _.filter(Game.creeps, (creep) => {return creep.memory.role == name;});
        var roomCreeps = _.filter(Game.creeps, (creep) => {return creep.memory.role == name && creep.memory.room == assignedRoom;});
        if(_.size(roomCreeps) < expected) {
            var body = s.chooseBody(Game.spawns[c.mainSpawn].room, name, _.size(totalCreeps));
            if(Game.spawns[c.mainSpawn].canCreateCreep(body) == OK) {
                var result = Game.spawns[c.mainSpawn].createCreep(body, null, {
                    role: name,
                    room: assignedRoom
                });
                if(_.isString(result)) {
                    console.log('Spawning new ' + name + ': ' + result);
                    return true;
                } else {
                    console.log('Spawn error: ' + result);
                }
            }
        }
        return false;
    },
    chooseBody: function(room, role, totalCount) {
        var body = [WORK,WORK,CARRY,MOVE];
        if(role == sh.CREEP_HARVESTER && totalCount == 0) {
            return body;
        }
        if(role == sh.CREEP_FILLER) {
            if(totalCount == 0) {
                return [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
            }
            var div = Math.trunc(room.energyCapacityAvailable/100);
            body = [];
            for(var i = 0; i < div; i++) {
                body.push(CARRY);
                body.push(MOVE);
            }
            return body;
        }
        if(role == sh.CREEP_CAPTURER) {
            return [CLAIM,MOVE,MOVE];
        }
        if(room.energyCapacityAvailable >= 350) {
            body.push(MOVE);
        }
        if(room.energyCapacityAvailable >= 450) {
            body.push(WORK);
        }
        if(room.energyCapacityAvailable >= 550) {
            body.push(WORK);
        }
        if(room.energyCapacityAvailable >= 600) {
            body.push(CARRY);
        }
        if(room.energyCapacityAvailable >= 700) {
            body.push(WORK);
        }
        if(room.energyCapacityAvailable >= 750) {
            body.push(MOVE);
        }
        if(room.energyCapacityAvailable >= 800) {
            body.push(CARRY);
        }
        return body;
    }
};
module.exports = s;
