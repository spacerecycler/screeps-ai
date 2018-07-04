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
import { CREEPS_WARLIKE, CreepType, RoomType } from "shared";
Creep.prototype.run = function() {
    this.setupMem();
    if (this.memory.role == CreepType.TRANSPORTER || this.ensureRoom()) {
        switch (this.memory.role) {
            case CreepType.HARVESTER:
                this.runHarvester();
                return;
            case CreepType.MINERAL_HARVESTER:
                this.runMineralHarvester();
                return;
            case CreepType.TRANSFER:
                this.runTransfer();
                return;
        }
        // Most creeps need energy to work, creeps above are either specialized or too simple
        if (this.carryCapacity > 0 && !this.isCreepWorking()) {
            if (this.memory.role == CreepType.TRANSPORTER && !this.ensureRoom()) {
                return;
            }
            const full = this.fillEnergy();
            if (!full) {
                return;
            }
        }
        switch (this.memory.role) {
            case CreepType.UPGRADER:
                this.runUpgrader();
                return;
            case CreepType.BUILDER:
                this.runBuilder();
                return;
            case CreepType.REPAIRER:
                this.runRepairer();
                return;
            case CreepType.CAPTURER:
                this.runCapturer();
                return;
            case CreepType.FILLER:
                this.runFiller();
                return;
            case CreepType.TRANSPORTER:
                this.runTransporter();
                return;
            case CreepType.SCOUT:
                this.runScout();
                return;
            case CreepType.WARRIOR:
                this.runWarrior();
                return;
            case CreepType.RANGER:
                this.runRanger();
                return;
            case CreepType.HEALER:
                this.runHealer();
                return;
            case CreepType.TANK:
                this.runTank();
                return;
        }
    }
};
Creep.prototype.setupMem = function() {
    if (this.memory.role == CreepType.HARVESTER && this.memory.targetSource == null
        && Game.rooms[this.memory.room] != null) {
        const sources = Game.rooms[this.memory.room].findSourcesForHarvester();
        if (_.isEmpty(sources)) {
            this.suicide();
        } else {
            this.memory.targetSource = _.head(sources).id;
        }
    }
    if (this.memory.role == CreepType.MINERAL_HARVESTER && this.memory.targetExtractor == null
        && Game.rooms[this.memory.room] != null) {
        const extractor = Game.rooms[this.memory.room].findExtractorForHarvester();
        if (extractor == null) {
            this.suicide();
        } else {
            this.memory.targetExtractor = extractor.id;
            this.memory.targetMineral = extractor.getMineral().id;
        }
    }
    if (Array<CreepTypeConstant>(CreepType.TANK, CreepType.WARRIOR,
        CreepType.RANGER).includes(this.memory.role)
        && Memory.rooms[this.memory.room].type == RoomType.KEEPER_LAIR && this.memory.targetSource == null
        && Game.rooms[this.memory.room] != null) {
        const sources = Game.rooms[this.memory.room].findSourcesForTank();
        if (!_.isEmpty(sources)) {
            this.memory.targetSource = _.head(sources).id;
        }
    }
};
Creep.prototype.ensureRoom = function() {
    if (CREEPS_WARLIKE.includes(this.memory.role) && Memory.rooms[this.memory.room].type == RoomType.KEEPER_LAIR) {
        if (!this.rally()) {
            return false;
        }
    }
    if (this.room.name != this.memory.room) {
        this.moveToS(new RoomPosition(25, 25, this.memory.room));
        return false;
    } else {
        return true;
    }
};
Creep.prototype.idle = function() {
    const flag = this.pos.findNearestIdleFlag();
    if (flag != null && !this.pos.isNearTo(flag)) {
        this.moveToI(flag);
    }
};
Creep.prototype.rally = function() {
    if (this.memory.ready) {
        return true;
    }
    if (!_.isEmpty(_.filter(Game.creeps, (c) => {
        return c.memory != null && c.memory.room == this.memory.room && c.memory.ready;
    }))) {
        return true;
    }
    const flag = _.head(_.filter(Game.flags, (f) => f.isRally(this.memory.room)));
    if (flag != null) {
        if (this.pos.isNearTo(flag)) {
            if (flag.hasRallyGroup()) {
                this.memory.ready = true;
                return true;
            } else {
                return false;
            }
        } else {
            this.moveToS(flag);
            return false;
        }
    }
    return false;
};
Creep.prototype.isCreepWorking = function() {
    // work until we have no more energy
    if (this.memory.working && _.sum(this.carry) == 0) {
        this.memory.working = false;
    }
    if (!this.memory.working && _.sum(this.carry) == this.carryCapacity) {
        this.memory.working = true;
        delete this.memory.energyTarget;
    }
    return this.memory.working;
};
Creep.prototype.fillEnergy = function() {
    // most creeps must harvest
    let target = Game.getObjectById<EnergyTarget>(this.memory.energyTarget);
    if (target != null) {
        const energyLeft = target.projectedEnergy();
        if (energyLeft == 0) {
            target = null;
            delete this.memory.energyTarget;
        }
    }
    if (target == null) {
        if (!this.room.hasHostileAttacker()) {
            target = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES,
                { filter: (r) => r.resourceType == RESOURCE_ENERGY });
            if (target == null) {
                target = this.pos.findClosestByPath(FIND_TOMBSTONES);
            }
        }
        if (target == null) {
            target = this.pos.findNearestNotEmptyLink();
        }
        if (target == null) {
            target = this.pos.findNearestNotEmptyContainer();
        }
        if (target == null && this.room.storage != null && this.room.isStorageNotEmpty()) {
            target = this.room.storage;
        }
        if (target == null && this.room.storage == null && this.room.containerCount() == 0
            && this.memory.role != CreepType.FILLER && this.memory.role != CreepType.TRANSPORTER) {
            target = this.pos.findClosestByPath(FIND_SOURCES);
        }
        if (target != null) {
            this.memory.energyTarget = target.id;
        }
    }
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            const energyTaken = target.giveEnergy(this);
            if (this.carry[RESOURCE_ENERGY] + energyTaken >= this.carryCapacity) {
                this.memory.working = true;
                delete this.memory.energyTarget;
                return true;
            } else {
                return false;
            }
        } else {
            this.moveToI(target);
        }
    } else {
        this.idle();
    }
    return false;
};
Creep.prototype.moveToI = function(target) {
    return this.moveTo(target, { reusePath: 5, maxRooms: 1, visualizePathStyle: {} });
};
Creep.prototype.moveToS = function(target) {
    return this.moveTo(target, { reusePath: 5, visualizePathStyle: {} });
};
Creep.prototype.doRepair = function(target) {
    if (this.repair(target) == ERR_NOT_IN_RANGE) {
        this.moveToI(target);
    }
};
Creep.prototype.dismantleNearestWall = function() {
    const wall = this.pos.findNearestWall();
    if (wall != null && this.dismantle(wall) == ERR_NOT_IN_RANGE) {
        this.moveToI(wall);
    }
};
