require('room');
require('room_pos');
require('room_obj');
require('source');
require('link');
require('spawn');
require('tower');
require('creep');
let m = {
    /** Main loop function for screeps **/
    loop: function() {
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
            wallsMax: 5000,
            canClaim: false,
            rooms: [],
            blacklist: []
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
            let room = Game.rooms[name];
            if(room != null && room.isMine()) {
                mine++;
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
        _.remove(Memory.config.blacklist, (id) => {
            return Game.getObjectById(id) == null;
        });
    }
};
module.exports = m;
