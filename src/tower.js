var _ = require('lodash');
var sh = require('shared');
var t = {
    /** Run towers **/
    runTowers: function() {
        _.forEach(Memory.rooms, (mem, room) => {
            if(Game.rooms[room] == null) {
                return true;
            }
            var towers = Game.rooms[room].find(FIND_MY_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_TOWER});
            _.forEach(towers, (tower) => {
                t.towerRepair(tower);
                // var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                // if(closestHostile) {
                //     tower.attack(closestHostile);
                // }
            });
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
