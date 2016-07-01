var _ = require('lodash');
var roles = require('roles');
var mainSpawn = Game.spawns.Spawn1;
var rooms = ['W24N3','W24N2'];
var expansion = Game.rooms.W24N2;
var main = {
    /** Main loop function for screeps **/
    loop: function() {
        main.clearMem();
        main.spawnCreeps();
        main.runTowers();
        main.runCreeps();
    },
    /** Clear unused memory **/
    clearMem: function() {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    },
    /** Spawn creeps that are missing **/
    spawnCreeps: function() {
        var spawning = false;
        spawning = main.spawnHarvester();
        if(!spawning) {
            spawning = main.spawnUpgrader();
        }
        if(!spawning) {
            spawning = main.spawnBuilder();
        }
        if(!spawning) {
            spawning = main.spawnRepairer();
        }
    },
    spawnHarvester: function() {
        for(var room in rooms) {
            var count = 0;
            if(Game.rooms[room].energyCapacityAvailable > 0) {
                count++;
            }
            if(Game.rooms[room].energyCapacityAvailable > 400) {
                count++;
            }
            if(count > 0) {
                return main.doSpawnCreep('harvester', count, room);
            }
        }
        return false;
    },
    spawnUpgrader: function() {
        return main.doSpawnCreep('upgrader', 1, mainSpawn);
    },
    spawnBuilder: function() {
        if(_.size(Game.constructionSites) > 0) {
            return main.doSpawnCreep('builder', 1, null);
        }
        return false;
    },
    spawnRepairer: function() {
        for(var room in rooms) {
            if(_.size(Game.rooms[room].find(FIND_MY_STRUCTURES, {filter: (structure) => {return structure.structureType == STRUCTURE_TOWER;}})) == 0) {
                return main.doSpawnCreep('repairer', 1, room);
            }
        }
        return false;
    },
    doSpawnCreep: function(name, expected, assignedRoom) {
        var roleCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == name && creep.memory.room == assignedRoom);
        if(_.size(roleCreeps) < expected) {
            var body = main.chooseBody(mainSpawn.room, name, _.size(roleCreeps));
            if(mainSpawn.canCreateCreep(body) == OK) {
                var result = mainSpawn.createCreep(body, null, {
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
    },
    /** Run towers **/
    runTowers: function() {
        for(var room in rooms) {
            var towers = Game.rooms[room].find(FIND_MY_STRUCTURES, {filter: (structure) => {return structure.structureType == STRUCTURE_TOWER;}})
            for(var tower in towers) {
                roles.towerRepair(tower);
                // var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                // if(closestHostile) {
                //     tower.attack(closestHostile);
                // }
            }
        }
    },
    /** Run creeps **/
    runCreeps: function() {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            roles.runCreep(creep);
        }
    }
};
module.exports = main;
