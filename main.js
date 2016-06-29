var roles = require('roles');
var expected = {harvester: 3, upgrader: 1, builder: 2, repairer: 1};

module.exports.loop = function () {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
    for(var name in expected) {
        var roleCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == name);
        var body = [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
        if(name == 'harvester' && roleCreeps.length == 0) {
            body = [WORK,WORK,CARRY,MOVE];
        }
        if(roleCreeps.length < expected[name] && Game.spawns.Spawn1.canCreateCreep(body) == OK) {
            var result = Game.spawns.Spawn1.createCreep(body, null, {role: name});
            if(_.isString(result)) {
                console.log('Spawning new ' + name + ': ' + result);
            } else {
                console.log('Spawn error: ' + result)
            }
        }
    }
    var tower = Game.getObjectById('57710cfff2ced3fd4686ff05');
    if(tower) {
        roles.towerRepair(tower);
        // var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // if(closestHostile) {
            // tower.attack(closestHostile);
        // }
    }
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        roles.runCreep(creep);
    }
}
