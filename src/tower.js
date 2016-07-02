var _ = require('lodash');
var c = require('config');
var sh = require('shared');
var t = {
    /** Run towers **/
    runTowers: function() {
        _.forEach(c.rooms, (room) => {
            if(Game.rooms[room] == null) {
                return true;
            }
            var towers = Game.rooms[room].find(FIND_MY_STRUCTURES, {filter: (structure) => {return structure.structureType == STRUCTURE_TOWER;}});
            _.forEach(towers, (tower) => {
                t.towerRepair(tower);
                // var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                // if(closestHostile) {
                //     tower.attack(closestHostile);
                // }
            });
            return true;
        });
    },
    towerRepair: function(tower) {
        if(Memory.towers[tower.id] == null) {
            Memory.towers[tower.id] = {};
        }
        sh.doRepair(tower.pos, Memory.towers[tower.id], function(target) {
            tower.repair(target);
        });
    }
};
module.exports = t;
