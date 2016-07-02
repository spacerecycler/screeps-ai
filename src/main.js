var _ = require('lodash');
var s = require('spawn');
var t = require('tower');
var cr = require('creep');
var m = {
    /** Main loop function for screeps **/
    loop: function() {
        m.clearMem();
        s.spawnCreeps();
        t.runTowers();
        cr.runCreeps();
    },
    /** Clear unused memory **/
    clearMem: function() {
        _.forEach(Memory.creeps, (value, name) => {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        });
        _.forEach(Memory.towers, (value, id) => {
            if(!Game.getObjectById(id)) {
                delete Memory.towers[id];
            }
        });
    }
};
module.exports = m;
