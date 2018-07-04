import { RoomType } from "shared";
import { ErrorMapper } from "utils/ErrorMapper";

import "creeps/creep";
import "flag";
import "resource";
import "room";
import "room-obj";
import "room-pos";
import "source";
import "structures/structure";
import "tombstone";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  setupMem();
  clearMem();
  const pct = Game.gcl.progress / Game.gcl.progressTotal * 100;
  const pctStr = pct.toFixed(1);
  if (Memory.vars.lastPct != pctStr) {
    console.log(`GCL Progress: ${pctStr}%`);
    Memory.vars.lastPct = pctStr;
  }
  const rooms = Memory.config.rooms.map((name) => Game.rooms[name]).filter((r) => r != null);
  rooms.sort((r) => r.energyAvailable).reverse();
  for (const room of rooms) {
    room.setupMem();
  }
  for (const room of rooms) {
    room.run();
  }
  _.forOwn(Game.creeps, (creep) => {
    creep.run();
  });
});

export const setupMem = () => {
  if (Memory.testing == null) {
    Memory.testing = false;
  }
  if (Memory.vars == null) {
    Memory.vars = {};
  }
  if (Memory.towers == null) {
    Memory.towers = {};
  }
  if (Memory.links == null) {
    Memory.links = {};
  }
  if (Memory.config == null) {
    Memory.config = {
      blacklist: {},
      canClaim: false,
      rooms: []
    };
  }
  if (Memory.rooms == null) {
    Memory.rooms = {};
  }
  if (Memory.flags == null) {
    Memory.flags = {};
  }
  if (_.isEmpty(Memory.config.rooms)) {
    _.forOwn(Game.spawns, (spawn) => {
      Memory.config.rooms.push(spawn.room.name);
    });
  }
  let mine = 0;
  for (const name of Memory.config.rooms) {
    if (!Memory.rooms[name]) {
      Memory.rooms[name] = {
        distance: {},
        wallsMax: 5000
      };
    }
    const room = Game.rooms[name];
    if (room != null && room.isMine()) {
      mine++;
    }
    if (Memory.config.blacklist[name] == null) {
      Memory.config.blacklist[name] = Array<string>();
    }
    if (room == null && Memory.rooms[name].type == RoomType.EXPANSION) {
      Memory.rooms[name].needReserve = true;
    }
  }
  Memory.config.canClaim = mine < Game.gcl.level;
};

export const clearMem = () => {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
  for (const id in Memory.towers) {
    if (!Game.getObjectById(id)) {
      delete Memory.towers[id];
    }
  }
  for (const id in Memory.links) {
    if (!Game.getObjectById(id)) {
      delete Memory.links[id];
    }
  }
  for (const name in Memory.config.blacklist) {
    if (!Game.rooms[name]) {
      const ids = Memory.config.blacklist[name];
      ids.filter((id) => Game.getObjectById(id) != null);
    }
  }
};
