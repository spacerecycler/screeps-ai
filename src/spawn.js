var _ = require('lodash');
var c = require('config');
var s = {
    /** Spawn creeps that are missing **/
    spawnCreeps: function() {
        var spawning = false;
        spawning = s.spawnHarvester();
        if(!spawning) {
            spawning = s.spawnUpgrader();
        }
        if(!spawning) {
            spawning = s.spawnBuilder();
        }
        if(!spawning) {
            // spawning = s.spawnRepairer();
        }
        if(!spawning) {
            // spawning = s.spawnCapturer();
        }
    },
    spawnHarvester: function() {
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
                if(s.doSpawnCreep('harvester', count, room)) {
                    spawned = true;
                    return false;
                }
            }
        });
        return spawned;
    },
    spawnUpgrader: function() {
        return s.doSpawnCreep('upgrader', 1, Game.spawns[c.mainSpawn].room.name);
    },
    spawnBuilder: function() {
        if(_.size(Game.constructionSites) > 0) {
            return s.doSpawnCreep('builder', 1, Game.spawns[c.mainSpawn].room.name);
        }
        return false;
    },
    spawnRepairer: function() {
        var spawned = false;
        _.forEach(c.rooms, (room) =>{
            if(Game.rooms[room] == null) {
                return true;
            }
            if(_.size(Game.rooms[room].find(FIND_MY_STRUCTURES, {filter: (structure) => {return structure.structureType == STRUCTURE_TOWER;}})) == 0) {
                if(s.doSpawnCreep('repairer', 1, room)) {
                    spawned = true;
                    return false;
                }
            }
        });
        return spawned;
    },
    spawnCapturer: function() {
        return s.doSpawnCreep('capturer', 1, c.expansion);
    },
    doSpawnCreep: function(name, expected, assignedRoom) {
        var roleCreeps = _.filter(Game.creeps, (creep) => {return creep.memory.role == name && creep.memory.room == assignedRoom;});
        if(_.size(roleCreeps) < expected) {
            var body = s.chooseBody(Game.spawns[c.mainSpawn].room, name, _.size(roleCreeps));
            if(Game.spawns[c.mainSpawn].canCreateCreep(body) == OK) {
                var result = Game.spawns[c.mainSpawn].createCreep(body, null, {
                    role: name,
                    room: assignedRoom
                });
                if(_.isString(result)) {
                    console.log('Spawning new ' + name + ': ' + result);
                    return true;
                } else {
                    console.log('Spawn error: ' + result)
                }
            }
        }
        return false;
    },
    chooseBody: function(room, role, count) {
        var body = [WORK,WORK,CARRY,MOVE];
        if(role == 'harvester' && count == 0) {
            return body;
        }
        if(role == 'capturer') {
            return [CLAIM,MOVE,MOVE,TOUGH];
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
