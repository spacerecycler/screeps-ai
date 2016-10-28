'use strict';
let sh = require('shared');
require('room');
require('room-pos');
require('room-obj');
require('flag');
require('source');
require('resource');
require('controller');
require('extractor');
require('link');
require('spawn');
require('tower');
require('terminal');
require('storage');
require('container');
require('creep');
var profiler = require('screeps-profiler');
profiler.enable();
let m = {
    /** Main loop function for screeps **/
    loop: function() {
        profiler.wrap(function() {
            m.setupMem();
            m.clearMem();
            let pct = Game.gcl.progress / Game.gcl.progressTotal * 100;
            pct = pct.toFixed(1);
            if(Memory.vars.lastPct != pct) {
                console.log("GCL Progress: " + pct + "%");
                Memory.vars.lastPct = pct;
            }
            let rooms = _.compact(_.map(Memory.config.rooms,
                (name) => Game.rooms[name]));
            rooms = _.sortBy(rooms, room => room.energyAvailable).reverse();
            for(let room of rooms) {
                room.setupMem();
            }
            for(let room of rooms) {
                room.run();
            }
            _.forEach(Game.creeps, (creep) => {
                creep.run();
            });
        });
    },
    setupMem: function() {
        if(Memory.vars == null) {
            Memory.vars = {};
        }
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
                wallsMax: 5000,
                distance: {}
            });
            let room = Game.rooms[name];
            if(room != null && room.isMine()) {
                mine++;
            }
            if(Memory.config.blacklist[name] == null) {
                Memory.config.blacklist[name] = [];
            }
            if(room == null && Memory.rooms[name].type == sh.ROOM_EXPANSION) {
                Memory.rooms[name].needReserve = true;
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
