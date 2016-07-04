var _ = require('lodash');
require('room');
require('spawn');
require('tower');
require('creep');
var m = {
    /** Main loop function for screeps **/
    loop: function() {
        if(Memory.config == null) {
            Memory.config = {};
        }
        if(Memory.config.wallsMax == null) {
            Memory.config.wallsMax = 5000;
        }
        m.clearMem();
        _.forEach(Memory.config.rooms, (name) => {
            var room = Game.rooms[name];
            if(room != null) {
                room.run();
            }
        });
        _.forEach(Game.creeps, (creep) => {
            creep.run();
        });
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
