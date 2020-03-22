import "creeps/econ/builder";
import "creeps/econ/capturer";
import "creeps/econ/filler";
import "creeps/econ/harvester";
import "creeps/econ/mineral_harvester";
import "creeps/econ/repairer";
import "creeps/econ/transfer";
import "creeps/econ/transporter";
import "creeps/econ/upgrader";
import "creeps/scout";
import "creeps/war/healer";
import "creeps/war/ranger";
import "creeps/war/tank";
import "creeps/war/warrior";
import { CREEPS_WARLIKE, CreepState, CreepType, RoomType } from "shared";
Creep.prototype.run = function () {
  this.setupMem();
  let actionDone = false;
  let numActions = 0;
  while (!actionDone && numActions < 2) {
    actionDone = this.performAction();
    numActions++;
  }
};
Creep.prototype.performAction = function () {
  switch (this.memory.state) {
    case CreepState.Spawning:
      if (CREEPS_WARLIKE.includes(this.memory.role) && Memory.rooms[this.memory.room].type == RoomType.KEEPER_LAIR) {
        this.memory.state = CreepState.Rally;
      } else {
        this.memory.state = CreepState.MoveToHomeRoom;
      }
      return false;
    case CreepState.Rally:
      if (this.rally()) {
        this.memory.state = CreepState.MoveToHomeRoom;
        return false;
      } else {
        return true;
      }
    case CreepState.MoveToHomeRoom:
      if (this.moveToHomeRoom()) {
        if (this.shouldGetResource()) {
          this.memory.state = CreepState.GetResource;
        } else {
          this.memory.state = CreepState.Work;
        }
        return false;
      } else {
        return true;
      }
    case CreepState.GetResource:
      if (this.fillResource()) {
        this.memory.state = CreepState.Work;
        return false;
      } else {
        return true;
      }
    case CreepState.Work:
      if (this.shouldGetResource() && this.store.getUsedCapacity() == 0) {
        this.memory.state = CreepState.GetResource;
        return false;
      }
      if (this.doWork()) {
        if (this.memory.role == CreepType.TRANSPORTER) {
          this.memory.state = CreepState.MoveToHomeRoom;
          return false;
        } else if (this.shouldGetResource()) {
          this.memory.state = CreepState.GetResource;
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    default:
      throw new Error("Invalid state");
  }
};
Creep.prototype.shouldGetResource = function () {
  return this.store.getCapacity() > 0 && this.memory.role != CreepType.TRANSFER;
};
Creep.prototype.fillResource = function () {
  switch (this.memory.role) {
    case CreepType.HARVESTER:
      return this.harvestEnergy();
    case CreepType.MINERAL_HARVESTER:
      return this.harvestMineral();
    default:
      return this.fillEnergy();
  }
};
Creep.prototype.doWork = function () {
  switch (this.memory.role) {
    case CreepType.HARVESTER:
      return this.runHarvester();
    case CreepType.MINERAL_HARVESTER:
      return this.runMineralHarvester();
    case CreepType.TRANSFER:
      return this.runTransfer();
    case CreepType.UPGRADER:
      return this.runUpgrader();
    case CreepType.BUILDER:
      return this.runBuilder();
    case CreepType.REPAIRER:
      return this.runRepairer();
    case CreepType.CAPTURER:
      return this.runCapturer();
    case CreepType.FILLER:
      return this.runFiller();
    case CreepType.TRANSPORTER:
      return this.runTransporter();
    case CreepType.SCOUT:
      return this.runScout();
    case CreepType.WARRIOR:
      return this.runWarrior();
    case CreepType.RANGER:
      return this.runRanger();
    case CreepType.HEALER:
      return this.runHealer();
    case CreepType.TANK:
      return this.runTank();
    default:
      throw new Error(`Creep type ${this.memory.role} has no work method`);
  }
};
Creep.prototype.setupMem = function () {
  if (
    this.memory.role == CreepType.HARVESTER &&
    this.memory.targetSource == null &&
    Game.rooms[this.memory.room] != null
  ) {
    const sources = Game.rooms[this.memory.room].findSourcesForHarvester();
    if (sources.length == 0) {
      this.suicide();
    } else {
      this.memory.targetSource = sources[0].id;
    }
  }
  if (
    this.memory.role == CreepType.MINERAL_HARVESTER &&
    this.memory.targetExtractor == null &&
    Game.rooms[this.memory.room] != null
  ) {
    const extractor = Game.rooms[this.memory.room].findExtractorForHarvester();
    if (extractor == null) {
      this.suicide();
    } else {
      this.memory.targetExtractor = extractor.id;
      this.memory.targetMineral = extractor.getMineral().id;
    }
  }
  if (
    Array<CreepTypeConstant>(CreepType.TANK, CreepType.WARRIOR, CreepType.RANGER).includes(this.memory.role) &&
    Memory.rooms[this.memory.room].type == RoomType.KEEPER_LAIR &&
    this.memory.targetSource == null &&
    Game.rooms[this.memory.room] != null
  ) {
    const [source] = Game.rooms[this.memory.room].findSourcesForTank();
    if (source) {
      this.memory.targetSource = source.id;
    }
  }
};
Creep.prototype.moveToHomeRoom = function () {
  if (this.room.name != this.memory.room) {
    this.moveToS(new RoomPosition(24, 24, this.memory.room));
    return false;
  } else {
    return true;
  }
};
Creep.prototype.idle = function () {
  const flag = this.pos.findNearestIdleFlag();
  if (flag != null && !this.pos.isNearTo(flag)) {
    this.moveToI(flag);
  }
};
Creep.prototype.hasRallied = function () {
  return this.memory.state != CreepState.Spawning && this.memory.state != CreepState.Rally;
};
Creep.prototype.rally = function () {
  if (Object.values(Game.creeps).filter((c) => c.memory.room == this.memory.room && c.hasRallied()).length > 0) {
    return true;
  }
  const [flag] = Object.values(Game.flags).filter((f) => f.isRally(this.memory.room));
  if (flag != null) {
    if (this.pos.isNearTo(flag)) {
      if (flag.hasRallyGroup()) {
        return true;
      }
    } else {
      this.moveToS(flag);
    }
  }
  return false;
};
Creep.prototype.fillEnergy = function () {
  // most creeps must harvest
  let target = null;
  if (this.memory.energyTarget !== undefined) {
    target = Game.getObjectById(this.memory.energyTarget);
  }
  if (target != null) {
    const energyLeft = target.projectedEnergy();
    if (energyLeft == 0) {
      target = null;
      delete this.memory.energyTarget;
    }
  }
  if (target == null) {
    if (!this.room.hasHostileAttacker()) {
      target = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: (r) => r.resourceType == RESOURCE_ENERGY });
      if (target == null) {
        target = this.pos.findClosestByPath(FIND_TOMBSTONES, { filter: (t) => t.getEnergy() > 0 });
      }
    }
    if (target == null) {
      target = this.pos.findNearestNotEmptyLink();
    }
    if (
      this.memory.role != CreepType.FILLER &&
      target == null &&
      this.room.storage != null &&
      this.room.isStorageNotEmpty()
    ) {
      target = this.room.storage;
    }
    if (target == null) {
      target = this.pos.findNearestNotEmptyContainer();
    }
    if (
      this.memory.role == CreepType.FILLER &&
      target == null &&
      this.room.storage != null &&
      this.room.isStorageNotEmpty()
    ) {
      target = this.room.storage;
    }
    if (
      target == null &&
      this.room.storage == null &&
      this.room.containerCount() == 0 &&
      this.body.filter((p) => p.type == WORK).length > 0
    ) {
      target = this.pos.findClosestByPath(FIND_SOURCES);
    }
    if (target != null) {
      this.memory.energyTarget = target.id;
    }
  }
  if (target != null) {
    if (this.pos.isNearTo(target)) {
      const energyTaken = target.giveEnergy(this);
      if (this.store[RESOURCE_ENERGY] + energyTaken >= this.store.getCapacity()) {
        delete this.memory.energyTarget;
        return true;
      }
    } else {
      this.moveToI(target);
    }
  } else {
    this.idle();
  }
  return false;
};
Creep.prototype.moveToI = function (target) {
  return this.moveTo(target, {
    ignoreRoads: this.memory.ignoreRoads,
    maxRooms: 1,
    reusePath: 5,
    visualizePathStyle: {},
  });
};
Creep.prototype.moveToS = function (target) {
  return this.moveTo(target, { ignoreRoads: this.memory.ignoreRoads, reusePath: 5, visualizePathStyle: {} });
};
Creep.prototype.doRepair = function (target) {
  if (this.repair(target) == ERR_NOT_IN_RANGE) {
    this.moveToI(target);
  }
};
Creep.prototype.dismantleNearestWall = function () {
  const wall = this.pos.findNearestWall();
  if (wall != null && this.dismantle(wall) == ERR_NOT_IN_RANGE) {
    this.moveToI(wall);
  }
};
