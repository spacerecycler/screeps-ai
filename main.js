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
        var body = [];
        switch(name) {
            case 'harvester':
                body = [WORK,WORK,CARRY,MOVE];
                break;
            default:
                body = [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE];
                break;
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
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        roles.runCreep(creep);
    }
}