var sh = require('shared');
require('source');
require('room');
require('room_pos');
require('spawn');
require('tower');
require('creep');
var m = {
    /** Main loop function for screeps **/
    loop: function() {
        m.setupMem();
        m.clearMem();
        _.forEach(Memory.config.rooms, function(name) {
            var room = Game.rooms[name];
            if(room != null) {
                room.run();
            }
        });
        _.forEach(Game.creeps, function(creep) {
            creep.run();
        });
    },
    setupMem: function() {
        if(Memory.config == null) {
            Memory.config = {};
        }
        _.defaults(Memory.config, {
            wallsMax: 5000,
            rooms: [],
            blacklist: [],
            towers: {}
        });
        if(_.isEmpty(Memory.config.rooms)) {
            _.forEach(Game.spawns, function(spawn) {
                Memory.config.rooms.push(spawn.room.name);
            });
        }
    },
    /** Clear unused memory **/
    clearMem: function() {
        _.forEach(Memory.creeps, function(value, name) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        });
        _.forEach(Memory.towers, function(value, id) {
            if(!Game.getObjectById(id)) {
                delete Memory.towers[id];
            }
        });
        _.remove(Memory.config.blacklist, function(id) {
            return Game.getObjectById(id) == null;
        });
    }
};
module.exports = m;
