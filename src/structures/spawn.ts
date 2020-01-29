import Haikunator from "haikunator";
import {CreepState, CreepType, RoomState, RoomType} from "shared";
StructureSpawn.prototype.run = function() {
  if (!this.spawning) {
    let spawnedOrMissing = false;
    spawnedOrMissing = this.spawnMissingCreep(this.room.name);
    const nearbyRooms = Memory.config.rooms.filter((name) => name != this.room.name && this.room.isNearTo(name));
    if (!spawnedOrMissing) {
      for (const name of nearbyRooms) {
        const room = Game.rooms[name];
        if (room != null && room.isMine()) {
          if (this.spawnMissingCreep(name)) {
            spawnedOrMissing = true;
            break;
          }
        }
      }
    }
    if (!spawnedOrMissing) {
      for (const name of nearbyRooms) {
        const room = Game.rooms[name];
        if (room == null || !room.isMine()) {
          if (this.spawnMissingCreep(name)) {
            spawnedOrMissing = true;
            break;
          }
        }
      }
    }
  }
  if (this.spawning) {
    this.room.visual.text(`🛠️ ${Memory.creeps[this.spawning.name].role} ${this.spawning.name}`, this.pos.x + 1,
      this.pos.y, {align: "left"});
  }
};
StructureSpawn.prototype.setupMem = function() {
  if (this.memory.roadTo == null) {
    this.memory.roadTo = {};
  }
};
StructureSpawn.prototype.spawnMissingCreep = function(roomName) {
  const expected = this.getExpectedCreeps(roomName);
  const room = Game.rooms[roomName];
  if (room != null && room.isMine() && this.doSpawnCreep(roomName, CreepType.HARVESTER, 1)) {
    return true;
  }
  if (room != null && room.isMine() && this.doSpawnCreep(roomName, CreepType.FILLER, 1)) {
    return true;
  }
  for (const [role, count] of expected) {
    if (this.doSpawnCreep(roomName, role, count)) {
      return true;
    }
  }
  return false;
};
StructureSpawn.prototype.getExpectedCreeps = function(roomName) {
  const expected = new Map<CreepTypeConstant, number>();
  const room = Game.rooms[roomName];
  if (room != null) {
    if (_.filter(Game.creeps, (creep) => creep.memory.role == CreepType.HARVESTER
      && creep.memory.room == roomName && creep.memory.targetSource == null).length == 0) {
      let harvesters = _.size(_.filter(Game.creeps, (creep) => creep.memory.role == CreepType.HARVESTER
        && creep.memory.room == roomName));
      if (room.checkNeedHarvester()) {
        harvesters++;
      }
      expected.set(CreepType.HARVESTER, harvesters);
    }
    const containerCount = room.containerCount();
    if (containerCount > 0 && !room.isMine()) {
      expected.set(CreepType.TRANSPORTER, containerCount * 2);
    }
    if (room.energyCapacityAvailable > 0) {
      if (room.energyCapacityAvailable > 400) {
        expected.set(CreepType.FILLER, 2);
      } else {
        expected.set(CreepType.FILLER, 1);
      }
    }
    if (room.isMine()) {
      if (room.storage != null) {
        const count = Math.max(1, Math.ceil(room.storage.store[RESOURCE_ENERGY] / 100000));
        expected.set(CreepType.UPGRADER, count);
      } else {
        expected.set(CreepType.UPGRADER, Math.max(1, room.containerCount()));
      }
      if (room.storage != null) {
        if (room.storage.pos.findInRange<OwnedStructure>(FIND_MY_STRUCTURES, 2,
          {filter: (t) => t.structureType == STRUCTURE_TOWER}).length != 0) {
          expected.set(CreepType.TRANSFER, 1);
        }
      }
    }
    const numConstructionSites = _.size(room.findConstructionSites());
    if (numConstructionSites > 1) {
      expected.set(CreepType.BUILDER, 2);
    } else if (numConstructionSites > 0) {
      expected.set(CreepType.BUILDER, 1);
    }
    if ((room.isMine() || room.memory.type == RoomType.EXPANSION) && !room.hasTower()) {
      expected.set(CreepType.REPAIRER, 1);
      if (room.hasHurtCreep()) {
        expected.set(CreepType.HEALER, 1);
      }
      if (room.hasHostileAttacker()) {
        expected.set(CreepType.WARRIOR, 1);
        expected.set(CreepType.HEALER, 1);
        expected.set(CreepType.RANGER, 1);
      }
    }
    if (room.isMine() && room.terminal != null) {
      if (room.findExtractorForHarvester() != null) {
        expected.set(CreepType.MINERAL_HARVESTER, 1);
      }
    }
  } else {
    if (Memory.rooms[roomName].type == null) {
      expected.set(CreepType.SCOUT, 1);
    } else if (Memory.rooms[roomName].type == RoomType.EXPANSION) {
      expected.set(CreepType.REPAIRER, 1);
    }
  }
  if (Memory.rooms[roomName].type == RoomType.EXPANSION) {
    let num = (3 - Math.min(2, Math.trunc(this.room.energyCapacityAvailable / 650))) % 3;
    if (Memory.rooms[roomName].numReserveSpots == 1) {
      num = 1;
    }
    if (Memory.rooms[roomName].state == RoomState.Claiming) {
      expected.set(CreepType.CAPTURER, 1);
    } else {
      if (Memory.rooms[roomName].state == RoomState.Reserving) {
        expected.set(CreepType.CAPTURER, num);
      } else {
        expected.set(CreepType.CAPTURER, num - 1);
      }
    }
  }
  if (Memory.rooms[roomName].type == RoomType.KEEPER_LAIR) {
    if (room != null && room.containerCount() > 0) {
      expected.set(CreepType.REPAIRER, 1);
    }
    // expected.set(CreepType.CREEP_TANK, 1);
    expected.set(CreepType.HEALER, 1);
    // expected.set(CreepType.CREEP_WARRIOR, 4);
    expected.set(CreepType.RANGER, 4);
  }
  return expected;
};
StructureSpawn.prototype.doSpawnCreep = function(roomName, newRole, count) {
  const roomCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == newRole && creep.memory.room == roomName);
  if (roomCreeps.length < count) {
    const body = this.chooseBody(newRole, roomName);
    const newCreepName = this.getRandomName();
    const newMem: CreepMemory = {
      ignoreRoads: body.length <= body.filter((p) => p == MOVE).length * 2,
      numWorkParts: body.filter((p) => p == WORK).length,
      role: newRole,
      room: roomName,
      state: CreepState.Spawning
    };
    const result = this.spawnCreep(body, newCreepName, {memory: newMem});
    if (result == OK) {
      // console.log(`body: ${body}`);
      console.log(`${this.name} Spawning new ${newRole} for ${roomName}: ${newCreepName}`);
      return true;
    } else if (result == ERR_NOT_ENOUGH_RESOURCES) {
      // console.log(`not enough resources, body: ${body}`);
    } else if (result == ERR_BUSY) {
      // do nothing
    } else {
      console.log(`Spawn error: ${result}, body: ${body}`);
    }
  }
  return false;
};
StructureSpawn.prototype.chooseBody = function(role, roomName) {
  const energyCapAvail = this.room.energyCapacityAvailable;
  const body = Array<BodyPartConstant>();
  let div = 0;
  let numCarry = 0;
  let cost = 0;
  const room = Game.rooms[roomName];
  switch (role) {
    case CreepType.CAPTURER:
      cost = BODYPART_COST[CLAIM] + BODYPART_COST[MOVE];
      div = Math.min(MAX_CREEP_SIZE / 2, Math.trunc(energyCapAvail / cost));
      if (Memory.rooms[roomName].numReserveSpots == 1) {
        div = 2;
      }
      this.addParts(body, div, CLAIM);
      this.addParts(body, div, MOVE);
      return body;
    case CreepType.FILLER:
      cost = BODYPART_COST[CARRY] + BODYPART_COST[MOVE];
      div = Math.min(MAX_CREEP_SIZE / 2, Math.trunc(energyCapAvail / cost));
      if (this.room.name == roomName && room.needsRecovery()) {
        div = 3;
      }
      this.addParts(body, div, CARRY);
      this.addParts(body, div, MOVE);
      return body;
    case CreepType.TRANSPORTER:
      cost = BODYPART_COST[CARRY] + BODYPART_COST[MOVE];
      div = Math.min(MAX_CREEP_SIZE / 2, Math.trunc(energyCapAvail / cost));
      this.addParts(body, div, CARRY);
      this.addParts(body, div, MOVE);
      return body;
    case CreepType.TRANSFER:
      return [CARRY, MOVE];
    case CreepType.SCOUT:
      return [MOVE];
    case CreepType.WARRIOR:
      this.addParts(body, 2, TOUGH);
      this.addParts(body, 5, MOVE);
      this.addParts(body, 4, ATTACK);
      body.push(MOVE);
      return body;
    case CreepType.RANGER:
      this.addParts(body, 2, TOUGH);
      this.addParts(body, 4, MOVE);
      this.addParts(body, 3, RANGED_ATTACK);
      body.push(MOVE);
      return body;
    case CreepType.HEALER:
      this.addParts(body, 1, TOUGH);
      this.addParts(body, 2, MOVE);
      this.addParts(body, 2, HEAL);
      body.push(MOVE);
      return body;
    case CreepType.TANK:
      this.addParts(body, 5, TOUGH);
      this.addParts(body, 6, MOVE);
      body.push(ATTACK);
      return body;
    case CreepType.HARVESTER:
      if (this.room.name == roomName) {
        if (room.needsRecovery()) {
          this.addParts(body, 2, WORK);
          this.addParts(body, 1, MOVE);
        } else {
          cost = BODYPART_COST[WORK];
          const baseCost = BODYPART_COST[CARRY] + BODYPART_COST[MOVE];
          div = Math.min(5, Math.trunc((energyCapAvail - baseCost) / cost));
          this.addParts(body, div, WORK);
          body.push(MOVE);
        }
      } else {
        let max = 5;
        if (Memory.rooms[roomName].type == RoomType.KEEPER_LAIR) {
          max = 7;
        }
        cost = BODYPART_COST[WORK] + BODYPART_COST[MOVE];
        const baseCost = BODYPART_COST[CARRY];
        div = Math.min(max, Math.trunc((energyCapAvail - baseCost) / cost));
        this.addParts(body, div, WORK);
        this.addParts(body, div, MOVE);
      }
      body.push(CARRY);
      return body;
    case CreepType.MINERAL_HARVESTER:
      this.addParts(body, 5, WORK);
      this.addParts(body, 1, CARRY);
      this.addParts(body, 5, MOVE);
      return body;
    case CreepType.BUILDER:
      if (energyCapAvail == 300) {
        return [WORK, CARRY, CARRY, MOVE, MOVE];
      } else {
        return [WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
      }
    case CreepType.UPGRADER:
    case CreepType.REPAIRER:
      cost = BODYPART_COST[WORK] + BODYPART_COST[MOVE];
      const carryCost = BODYPART_COST[CARRY] + BODYPART_COST[MOVE];
      numCarry = Math.min(Math.trunc(MAX_CREEP_SIZE / 6), Math.ceil(energyCapAvail / (cost * 2 + carryCost)));
      div = Math.min(Math.trunc(MAX_CREEP_SIZE / 3),
        Math.trunc((energyCapAvail - numCarry * carryCost) / cost));
      this.addParts(body, div, WORK);
      this.addParts(body, div, MOVE);
      this.addParts(body, numCarry, CARRY);
      this.addParts(body, numCarry, MOVE);
      return body;
    default:
      return body;
  }
};
StructureSpawn.prototype.addParts = (body, times, part) => {
  _.times(times, () => {
    body.push(part);
  });
};
// TODO: needs to be optimized to find an unused name
StructureSpawn.prototype.getRandomName = () => {
  return new Haikunator().haikunate();
};
