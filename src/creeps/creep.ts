import { CREEPS_WARLIKE, CreepType, RoomType } from "shared";
Creep.prototype.run = function() {
    this.setupMem();
    if (this.memory.role == CreepType.CREEP_TRANSPORTER || this.ensureRoom()) {
        if (this.memory.role == CreepType.CREEP_HARVESTER) {
            this.runHarvester();
            return;
        }
        if (this.memory.role == CreepType.CREEP_MINERAL_HARVESTER) {
            this.runMineralHarvester();
            return;
        }
        if (this.memory.role == CreepType.CREEP_TRANSFER) {
            this.runTransfer();
            return;
        }
        if (this.carryCapacity > 0 && !this.isCreepWorking()) {
            if (this.memory.role == CreepType.CREEP_TRANSPORTER && !this.ensureRoom()) {
                return;
            }
            const full = this.fillEnergy();
            if (!full) {
                return;
            }
        }
        switch (this.memory.role) {
            case CreepType.CREEP_UPGRADER:
                this.runUpgrader();
                return;
            case CreepType.CREEP_BUILDER:
                this.runBuilder();
                return;
            case CreepType.CREEP_REPAIRER:
                this.runRepairer();
                return;
            case CreepType.CREEP_CAPTURER:
                this.runCapturer();
                return;
            case CreepType.CREEP_FILLER:
                this.runFiller();
                return;
            case CreepType.CREEP_TRANSPORTER:
                this.runTransporter();
                return;
            case CreepType.CREEP_SCOUT:
                this.runScout();
                return;
            case CreepType.CREEP_WARRIOR:
                this.runWarrior();
                return;
            case CreepType.CREEP_RANGER:
                this.runRanger();
                return;
            case CreepType.CREEP_HEALER:
                this.runHealer();
                return;
            case CreepType.CREEP_TANK:
                this.runTank();
                return;
        }
    }
};
Creep.prototype.setupMem = function() {
    if (this.memory.role == CreepType.CREEP_HARVESTER
        && this.memory.targetSource == null
        && Game.rooms[this.memory.room] != null) {
        const sources = Game.rooms[this.memory.room].findSourcesForHarvester();
        if (_.isEmpty(sources)) {
            this.suicide();
        } else {
            this.memory.targetSource = _.head(sources).id;
        }
    }
    if (this.memory.role == CreepType.CREEP_MINERAL_HARVESTER
        && this.memory.targetExtractor == null
        && Game.rooms[this.memory.room] != null) {
        const extractor = Game.rooms[this.memory.room]
            .findExtractorForHarvester();
        if (extractor == null) {
            this.suicide();
        } else {
            this.memory.targetExtractor = extractor.id;
            this.memory.targetMineral = extractor.getMineral().id;
        }
    }
    if (Array<CreepTypeConstant>(CreepType.CREEP_TANK, CreepType.CREEP_WARRIOR,
        CreepType.CREEP_RANGER).includes(this.memory.role)
        && Memory.rooms[this.memory.room].type == RoomType.ROOM_KEEPER_LAIR
        && this.memory.targetSource == null
        && Game.rooms[this.memory.room] != null) {
        const sources = Game.rooms[this.memory.room].findSourcesForTank();
        if (!_.isEmpty(sources)) {
            this.memory.targetSource = _.head(sources).id;
        }
    }
};
Creep.prototype.runBuilder = function() {
    let target = Game.getObjectById<ConstructionSite>(this.memory.targetId);
    if (target == null) {
        target = this.pos.findNearestConstructionSite([STRUCTURE_WALL,
            STRUCTURE_RAMPART]);
    }
    if (target == null && this.room.containerCount() == 0) {
        target = this.pos.findNearestConstructionSite([STRUCTURE_CONTAINER]);
    }
    if (target == null) {
        target = this.pos.findNearestConstructionSite([STRUCTURE_ROAD]);
    }
    if (target == null) {
        target = this.pos.findNearestConstructionSite([STRUCTURE_TOWER,
            STRUCTURE_EXTENSION]);
    }
    if (target == null) {
        target = this.pos.findNearestConstructionSite([STRUCTURE_CONTAINER]);
    }
    if (target == null) {
        target = this.pos.findNearestConstructionSite();
    }
    if (target == null && _.size(Game.constructionSites) > 0) {
        target = _.values<ConstructionSite>(Game.constructionSites)[0];
        this.memory.room = target.pos.roomName;
    }
    if (target != null) {
        this.memory.targetId = target.id;
        if (this.build(target) == ERR_NOT_IN_RANGE) {
            this.moveToI(target);
        }
    } else {
        this.idle();
    }
};
Creep.prototype.runFiller = function() {
    let target = null;
    if (!this.room.hasHostileAttacker()) {
        target = this.pos.findNearestFillTarget(STRUCTURE_EXTENSION);
        if (target == null) {
            target = this.pos.findNearestFillTarget(STRUCTURE_SPAWN);
        }
    }
    if (target == null) {
        target = this.pos.findNearestFillTarget(STRUCTURE_TOWER);
    }
    if (target == null && this.room.isStorageNotFull()
        && (!_.isEmpty(this.room.findNotEmptyContainers())
            || !_.isEmpty(this.room.findNotEmptyLinks()))) {
        target = this.room.storage;
    }
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            this.transfer(target, RESOURCE_ENERGY);
        } else {
            this.moveToI(target);
        }
    } else {
        this.idle();
    }
};
Creep.prototype.runTransporter = function() {
    let target = Game.getObjectById<StructureStorage | StructureContainer>(this.memory.targetId);
    if (target != null && target.store[RESOURCE_ENERGY] == target.storeCapacity) {
        delete this.memory.targetId;
        target = null;
    }
    if (target == null) {
        let distance = 255;
        for (const name in Memory.config.rooms) {
            const room = Game.rooms[name];
            if (room != null && room.isMine() && room.isStorageNotFull()) {
                const route = Game.map.findRoute(this.room.name, room.name);
                if (route != ERR_NO_PATH && route.length < distance) {
                    distance = route.length;
                    target = room.storage == null ? null : room.storage;
                }
            }
        }
        if (target != null) {
            this.memory.targetId = target.id;
        }
    }
    if (target == null) {
        const targets = Memory.config.rooms.map((n) => {
            const room = Game.rooms[n];
            if (room != null && room.isMine()) {
                return room.findNotFullContainers();
            } else {
                return Array<StructureContainer>();
            }
        }).reduce((a, b) => a.concat(b), []);
        let curEnergy = CONTAINER_CAPACITY;
        for (const t of targets) {
            if (t.store[RESOURCE_ENERGY] < curEnergy) {
                target = t;
                curEnergy = t.store[RESOURCE_ENERGY];
            }
        }
        if (target != null) {
            this.memory.targetId = target.id;
        }
    }
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            this.transfer(target, RESOURCE_ENERGY);
        } else {
            this.moveToS(target);
        }
    }
};
Creep.prototype.runTransfer = function() {
    if (this.room.storage == null) {
        return;
    }
    const storagePos = this.room.storage.pos;
    const tower = _.head(storagePos.findInRange<StructureTower>(FIND_MY_STRUCTURES, 2,
        { filter: (t) => t.structureType == STRUCTURE_TOWER }));
    if (!this.memory.shouldFillTower
        && tower.energy < tower.energyCapacity * 0.9) {
        this.memory.shouldFillTower = true;
    }
    if (this.memory.shouldFillTower && tower.energy == tower.energyCapacity) {
        this.memory.shouldFillTower = false;
    }
    const link = _.head(storagePos.findInRange<StructureLink>(FIND_MY_STRUCTURES, 2,
        { filter: (t) => t.structureType == STRUCTURE_LINK }));
    if (!this.pos.isNearTo(this.room.storage)) {
        this.moveToI(this.room.storage);
        return;
    }
    if (!this.pos.isNearTo(tower)) {
        this.moveToI(tower);
        return;
    }
    if (link != null && !this.pos.isNearTo(link)) {
        this.moveToI(link);
        return;
    }
    if (link != null) {
        this.withdraw(link, RESOURCE_ENERGY, 25);
    } else {
        this.withdraw(this.room.storage, RESOURCE_ENERGY, 25);
    }
    if (this.memory.shouldFillTower) {
        this.transfer(tower, RESOURCE_ENERGY);
    } else if (link != null) {
        this.transfer(this.room.storage, RESOURCE_ENERGY);
    }
};
Creep.prototype.runHarvester = function() {
    const targetSource = Game.getObjectById<Source>(this.memory.targetSource);
    if (targetSource == null) {
        return;
    }
    if (!this.isCreepWorking()) {
        if (this.pos.isNearTo(targetSource)) {
            let energyTaken = 0;
            if (this.harvest(targetSource) == OK) {
                energyTaken = Math.min(this.memory.numWorkParts * HARVEST_POWER,
                    targetSource.energy);
                // targetSource.energy -= energyTaken;
            }
            if (this.carry[RESOURCE_ENERGY] + energyTaken < this.carryCapacity) {
                return;
            }
        } else {
            if (this.moveToI(targetSource) != OK) {
                this.dismantleNearestWall();
            }
            return;
        }
    }
    let target = null;
    target = targetSource.pos.findNearestNotFullLink();
    if (target != null && !targetSource.pos.inRangeTo(target, 2)) {
        target = null;
    }
    if (target == null && this.room.storage != null && this.room.isStorageNotFull()
        && this.pos.inRangeTo(this.room.storage, 3)) {
        target = this.room.storage;
    }
    if (target == null) {
        target = targetSource.pos.findNearbyNotFullContainer();
    }
    if (target == null) {
        target = this.pos.findNearestFillTarget(STRUCTURE_EXTENSION);
    }
    if (target == null) {
        target = this.pos.findNearestFillTarget(STRUCTURE_SPAWN);
    }
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            this.transfer(target, RESOURCE_ENERGY);
        } else {
            this.moveToI(target);
        }
    } else {
        target = _.head(targetSource.pos.findInRange(
            FIND_MY_CONSTRUCTION_SITES, 2));
        if (target != null) {
            if (this.pos.isNearTo(target)) {
                this.build(target);
            } else {
                this.moveToI(target);
            }
            return;
        }
        this.idle();
    }
};
Creep.prototype.runMineralHarvester = function() {
    const targetExtractor = Game.getObjectById<StructureExtractor>(this.memory.targetExtractor);
    const targetMineral = Game.getObjectById<Mineral>(this.memory.targetMineral);
    if (targetExtractor == null) {
        return;
    }
    if (targetMineral == null) {
        console.log(this.name + " error mineral");
        return;
    }
    if (!this.isCreepWorking()) {
        if (this.pos.isNearTo(targetMineral)) {
            let mineralTaken = 0;
            if (this.harvest(targetMineral) == OK) {
                mineralTaken = Math.min(this.memory.numWorkParts * HARVEST_POWER,
                    targetMineral.mineralAmount);
                // targetSource.energy -= energyTaken;
            }
            const curCarry = this.carry[targetMineral.mineralType];
            if (curCarry != null && curCarry + mineralTaken
                < this.carryCapacity) {
                return;
            }
        } else {
            if (this.moveToI(targetMineral) != OK) {
                this.dismantleNearestWall();
            }
            return;
        }
    }
    let target = null;
    target = targetExtractor.room.terminal;
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            this.transfer(target, targetMineral.mineralType);
        } else {
            this.moveToI(target);
        }
    }
};
Creep.prototype.runUpgrader = function() {
    const target = this.room.controller;
    if (target == null) {
        return;
    }
    if (this.upgradeController(target) == ERR_NOT_IN_RANGE) {
        this.moveToI(target);
    }
};
Creep.prototype.runRepairer = function() {
    let target = this.tryRepair(this.memory);
    if (target == null) {
        const objects = Memory.config.blacklist[this.room.name].map((id) => Game.getObjectById(id));
        target = _.head(objects.map((t) => t instanceof Structure ? t : null).filter((t) => t != null));
        if (target != null && this.dismantle(target) == ERR_NOT_IN_RANGE) {
            this.moveToI(target);
        }
    }
    if (target == null) {
        this.idle();
    }
};
Creep.prototype.runCapturer = function() {
    if (this.room.controller == null) {
        return;
    }
    if (this.pos.isNearTo(this.room.controller)) {
        if (Memory.config.canClaim && this.room.memory.shouldClaim) {
            this.claimController(this.room.controller);
            delete this.room.memory.type;
            delete this.room.memory.needReserve;
            Memory.config.canClaim = false;
        } else {
            this.reserveController(this.room.controller);
        }
    } else {
        this.moveToI(this.room.controller);
    }
};
Creep.prototype.runScout = function() {
    const targets = this.room.find(FIND_SOURCES);
    const target = _.head(targets);
    if (!this.pos.isNearTo(target)) {
        this.moveToI(target);
    } else {
        this.suicide();
    }
};
Creep.prototype.runWarrior = function() {
    if (!this.memory.ready) {
        this.memory.ready = true;
    }
    const source = Game.getObjectById<Source>(this.memory.targetSource);
    if (source != null) {
        const target = _.head(source.findNearbyHostile());
        if (target != null) {
            if (this.pos.isNearTo(target)) {
                this.attack(target);
            } else {
                this.moveToS(target);
            }
        } else {
            this.idle();
        }
    } else {
        const target = this.pos.findNearestAttacker();
        if (target != null) {
            if (this.attack(target) == ERR_NOT_IN_RANGE) {
                this.moveToI(target);
            }
        } else {
            this.idle();
        }
    }
};
Creep.prototype.runRanger = function() {
    if (!this.memory.ready) {
        this.memory.ready = true;
    }
    const source = Game.getObjectById<Source>(this.memory.targetSource);
    if (source != null) {
        const target = _.head(source.findNearbyHostile());
        if (target != null) {
            if (this.pos.inRangeTo(target, 3)) {
                this.rangedAttack(target);
            } else {
                this.moveToS(target);
            }
        } else {
            this.idle();
        }
    } else {
        const target = this.pos.findNearestAttacker();
        if (target != null) {
            if (this.pos.inRangeTo(target, 3)) {
                this.rangedAttack(target);
            } else {
                this.moveToI(target);
            }
        } else {
            this.idle();
        }
    }
};
Creep.prototype.runHealer = function() {
    if (this.hits < this.hitsMax * 0.9) {
        this.heal(this);
    }
    let target = this.pos.findNearestHurtCreep([CreepType.CREEP_TANK]);
    if (target == null) {
        target = this.pos.findNearestHurtCreep([CreepType.CREEP_RANGER,
        CreepType.CREEP_WARRIOR]);
    }
    if (target == null) {
        target = this.pos.findNearestHurtCreep();
    }
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            this.heal(target);
        } else {
            this.rangedHeal(target);
            this.moveToI(target);
        }
    } else {
        this.idle();
    }
};
Creep.prototype.runTank = function() {
    if (!this.memory.ready) {
        this.memory.ready = true;
    }
    const source = Game.getObjectById<Source>(this.memory.targetSource);
    if (source == null) {
        return;
    }
    const target = _.head(source.findNearbyHostile());
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            this.attack(target);
        } else {
            this.moveToS(target);
        }
    } else {
        this.idle();
    }
};
Creep.prototype.ensureRoom = function() {
    if (CREEPS_WARLIKE.includes(this.memory.role)
        && Memory.rooms[this.memory.room].type == RoomType.ROOM_KEEPER_LAIR) {
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
        return c.memory != null && c.memory.room == this.memory.room
            && c.memory.ready;
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
            target = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: (r) => r.resourceType == RESOURCE_ENERGY
            });
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
        if (target == null && this.room.storage == null
            && this.room.containerCount() == 0
            && this.memory.role != CreepType.CREEP_FILLER
            && this.memory.role != CreepType.CREEP_TRANSPORTER) {
            target = this.pos.findClosestByPath(FIND_SOURCES);
        }
        if (target != null) {
            this.memory.energyTarget = target.id;
        }
    }
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            const energyTaken = target.giveEnergy(this);
            if (this.carry[RESOURCE_ENERGY] + energyTaken
                >= this.carryCapacity) {
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
    return this.moveTo(target, { reusePath: 4, maxRooms: 1, visualizePathStyle: {} });
};
Creep.prototype.moveToS = function(target) {
    return this.moveTo(target, { reusePath: 4, visualizePathStyle: {} });
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
