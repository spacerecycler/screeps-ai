var roles = require('roles');
var expected = {harvester: 3, upgrader: 1, builder: 2, repairer: 1};
var main = {
    /** Main loop function for screeps **/
    loop: function() {
        var room = Game.rooms.W24N3;
        main.clearMem();
        main.spawnCreeps(room);
        main.runTower();
        main.runcreeps();
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
    spawnCreeps: function(room) {
        for(var name in expected) {
            var roleCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == name);
            if(roleCreeps.length < expected[name]) {
                var body = main.chooseBody(room, name, roleCreeps.length);
                if(Game.spawns.Spawn1.canCreateCreep(body) == OK) {
                    var result = Game.spawns.Spawn1.createCreep(body, null, {role: name});
                    if(_.isString(result)) {
                        console.log('Spawning new ' + name + ': ' + result);
                        break;
                    } else {
                        console.log('Spawn error: ' + result)
                    }
                }
            }
        }
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
    runTower: function() {
        var tower = Game.getObjectById('57710cfff2ced3fd4686ff05');
        if(tower) {
            roles.towerRepair(tower);
            // var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            // if(closestHostile) {
                // tower.attack(closestHostile);
            // }
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
