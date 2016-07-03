var _ = require('lodash');
var s = require('spawn');
var t = require('tower');
var cr = require('creep');
var m = {
    /** Main loop function for screeps **/
    loop: function() {
        if(Memory.config == null) {
            Memory.config = {};
        }
        if(Memory.config.wallsMax == null) {
            Memory.config.wallsMax = 5000;
        }
        if(Memory.config.mainSpawn == null) {
            console.error("Please configure main spawn");
            return;
        }
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
        if(Memory.towers == null) {
            Memory.towers = {};
        }
        _.forEach(Memory.towers, (value, id) => {
            if(!Game.getObjectById(id)) {
                delete Memory.towers[id];
            }
        });
    }
};
module.exports = m;
