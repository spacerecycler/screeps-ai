require('room');
require('room_pos');
require('room_obj');
require('flag');
require('source');
require('controller');
require('link');
require('spawn');
require('tower');
require('creep');
var profiler = require('screeps-profiler');
profiler.enable();
let m = {
    /** Main loop function for screeps **/
    loop: function() {
        profiler.wrap(function() {
            if(Game.gcl.progress % 1000 < 10) {
                console.log("GCL Progress: " + Game.gcl.progress);
            }
            m.setupMem();
            m.clearMem();
            _.forEach(Memory.config.rooms, (name) => {
                let room = Game.rooms[name];
                if(room != null) {
                    room.run();
                }
            });
            _.forEach(Game.creeps, (creep) => {
                creep.run();
            });
        });
    },
    setupMem: function() {
        if(Memory.towers == null) {
            Memory.towers = {};
        }
        if(Memory.links == null) {
            Memory.links = {};
        }
        if(Memory.config == null) {
            Memory.config = {};
        }
        _.defaults(Memory.config, {
            canClaim: false,
            rooms: [],
            blacklist: {}
        });
        if(_.isEmpty(Memory.config.rooms)) {
            _.forEach(Game.spawns, (spawn) => {
                Memory.config.rooms.push(spawn.room.name);
            });
        }
        let mine = 0;
        _.forEach(Memory.config.rooms, (name) => {
            if(Memory.rooms[name] == null) {
                Memory.rooms[name] = {};
            }
            _.defaults(Memory.rooms[name], {
                wallsMax: 5000
            });
            let room = Game.rooms[name];
            if(room != null && room.isMine()) {
                mine++;
            }
            if(Memory.config.blacklist[name] == null) {
                Memory.config.blacklist[name] = [];
            }
        });
        Memory.config.canClaim = mine < Game.gcl.level;
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
        _.forEach(Memory.links, (value, id) => {
            if(!Game.getObjectById(id)) {
                delete Memory.links[id];
            }
        });
        _.forEach(Memory.config.blacklist, (ids, name) => {
            if(Game.rooms[name] != null) {
                _.remove(ids, (id) => Game.getObjectById(id) == null);
            }
        });
    }
};
module.exports = m;
