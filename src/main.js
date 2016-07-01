var _ = require('lodash');
var c = require('config');
var s = require('spawn');
var r = require('roles');
var m = {
    /** Main loop function for screeps **/
    loop: function() {
        m.clearMem();
        s.spawnCreeps();
        m.runTowers();
        m.runCreeps();
    },
    /** Clear unused memory **/
    clearMem: function() {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    },

    /** Run towers **/
    runTowers: function() {
        _.forEach(c.rooms, (room) => {
            if(Game.rooms[room] != null) {
                var towers = Game.rooms[room].find(FIND_MY_STRUCTURES, {filter: (structure) => {return structure.structureType == STRUCTURE_TOWER;}})
                _.forEach(towers, (tower) => {
                    r.towerRepair(tower);
                    // var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    // if(closestHostile) {
                    //     tower.attack(closestHostile);
                    // }
                });
            }
        });
    },
    /** Run creeps **/
    runCreeps: function() {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            r.runCreep(creep);
        }
    }
};
module.exports = m;
