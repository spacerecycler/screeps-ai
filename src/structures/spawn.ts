import Haikunator from "haikunator";
import { CreepType, RoomType } from "shared";
StructureSpawn.prototype.run = function() {
    if (Memory.testing && !this.memory.roadsToSources) {
        for (const source of this.room.find(FIND_SOURCES)) {
            const vals = PathFinder.search(this.pos, { pos: source.pos, range: 1 });
            for (const val of vals.path) {
                this.room.createConstructionSite(val, STRUCTURE_ROAD);
            }
        }
        this.memory.roadsToSources = true;
    }
    let spawnedOrMissing = false;
    spawnedOrMissing = this.spawnMissingCreep(this.room.name);
    if (!spawnedOrMissing) {
        for (const name of Memory.config.rooms) {
            const room = Game.rooms[name];
            if (name != this.room.name && room != null && room.isMine() && this.room.isNearTo(room)) {
                spawnedOrMissing = this.spawnMissingCreep(name);
                break;
            }
        }
    }
    if (!spawnedOrMissing) {
        for (const name of Memory.config.rooms) {
            const room = Game.rooms[name];
            if ((room == null || !room.isMine()) && this.room.isNearTo(name)) {
                spawnedOrMissing = this.spawnMissingCreep(name);
                break;
            }
        }
    }
};
StructureSpawn.prototype.spawnMissingCreep = function(roomName) {
    const expected = this.getExpectedCreeps(roomName);
    const room = Game.rooms[roomName];
    if (room != null && room.isMine() && this.doSpawnCreep(roomName, CreepType.CREEP_HARVESTER, 1)) {
        return true;
    }
    if (room != null && room.isMine() && this.doSpawnCreep(roomName, CreepType.CREEP_FILLER, 1)) {
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
        if (_.isEmpty(_.filter(Game.creeps, (creep) => {
            return creep.memory.role == CreepType.CREEP_HARVESTER && creep.memory.room == roomName
                && creep.memory.targetSource == null;
        }))) {
            let harvesters = _.size(_.filter(Game.creeps, (creep) => {
                return creep.memory.role == CreepType.CREEP_HARVESTER && creep.memory.room == roomName;
            }));
            if (room.checkNeedHarvester()) {
                harvesters++;
            }
            expected.set(CreepType.CREEP_HARVESTER, harvesters);
        }
        const containerCount = room.containerCount();
        if (containerCount > 0 && !room.isMine()) {
            expected.set(CreepType.CREEP_TRANSPORTER, containerCount * 2);
        }
        if (room.energyCapacityAvailable > 0) {
            if (room.energyCapacityAvailable > 400) {
                expected.set(CreepType.CREEP_FILLER, 2);
            } else {
                expected.set(CreepType.CREEP_FILLER, 1);
            }
        }
        if (room.isMine()) {
            if (room.storage != null) {
                const count = Math.max(1, Math.ceil(room.storage.store[RESOURCE_ENERGY] / 100000));
                expected.set(CreepType.CREEP_UPGRADER, count);
            } else {
                expected.set(CreepType.CREEP_UPGRADER, Math.max(1, room.containerCount()));
            }
            if (room.storage != null) {
                if (!_.isEmpty(room.storage.pos.findInRange<OwnedStructure>(FIND_MY_STRUCTURES, 2,
                    { filter: (t) => t.structureType == STRUCTURE_TOWER }))) {
                    expected.set(CreepType.CREEP_TRANSFER, 1);
                }
            }
        }
        const numConstructionSites = _.size(room.findConstructionSites());
        if (numConstructionSites > 1) {
            expected.set(CreepType.CREEP_BUILDER, 2);
        } else if (numConstructionSites > 0) {
            expected.set(CreepType.CREEP_BUILDER, 1);
        }
        if ((room.isMine() || room.memory.type == RoomType.ROOM_EXPANSION)
            && !room.hasTower()) {
            expected.set(CreepType.CREEP_REPAIRER, 1);
            if (room.hasHurtCreep()) {
                expected.set(CreepType.CREEP_HEALER, 1);
            }
            if (room.hasHostileAttacker()) {
                expected.set(CreepType.CREEP_WARRIOR, 1);
                expected.set(CreepType.CREEP_HEALER, 1);
                expected.set(CreepType.CREEP_RANGER, 1);
            }
        }
        if (room.isMine() && room.terminal != null) {
            if (room.findExtractorForHarvester() != null) {
                expected.set(CreepType.CREEP_MINERAL_HARVESTER, 1);
            }
        }
    } else {
        if (Memory.rooms[roomName].type == null) {
            expected.set(CreepType.CREEP_SCOUT, 1);
        } else if (Memory.rooms[roomName].type == RoomType.ROOM_EXPANSION) {
            expected.set(CreepType.CREEP_REPAIRER, 1);
        }
    }
    if (Memory.rooms[roomName].needReserve != null) {
        let num = (3 - Math.min(2, Math.trunc(this.room.energyCapacityAvailable / 650))) % 3;
        if (Memory.rooms[roomName].controllerReserveSpots == 1) {
            num = 1;
        }
        if (Memory.config.canClaim) {
            expected.set(CreepType.CREEP_CAPTURER, 1);
        } else {
            if (Memory.rooms[roomName].needReserve) {
                expected.set(CreepType.CREEP_CAPTURER, num);
            } else {
                expected.set(CreepType.CREEP_CAPTURER, num - 1);
            }
        }
    }
    if (Memory.rooms[roomName].type == RoomType.ROOM_KEEPER_LAIR) {
        if (room != null && room.containerCount() > 0) {
            expected.set(CreepType.CREEP_REPAIRER, 1);
        }
        // expected.set(CreepType.CREEP_TANK, 1);
        expected.set(CreepType.CREEP_HEALER, 1);
        // expected.set(CreepType.CREEP_WARRIOR, 4);
        expected.set(CreepType.CREEP_RANGER, 4);
    }
    return expected;
};
StructureSpawn.prototype.doSpawnCreep = function(roomName, newRole, count) {
    const roomCreeps = _.filter(Game.creeps, (creep) => {
        return creep.memory.role == newRole && creep.memory.room == roomName;
    });
    if (_.size(roomCreeps) < count) {
        const body = this.chooseBody(newRole, roomName);
        const newCreepName = this.getRandomName();
        const dryRunResult = this.spawnCreep(body, newCreepName, { dryRun: true });
        if (dryRunResult == OK) {
            const newMem: CreepMemory = {
                numWorkParts: body.filter((p) => p == WORK).length,
                role: newRole,
                room: roomName
            };
            const result = this.spawnCreep(body, newCreepName, { memory: newMem });
            if (result == OK) {
                // console.log(`body: ${body}`);
                console.log(`${this.name} Spawning new ${newRole} for ${roomName}: ${newCreepName}`);
                return true;
            } else {
                console.log(`${this.name} Spawn error: ${result}`);
            }
        } else if (dryRunResult == ERR_NOT_ENOUGH_RESOURCES) {
            return true;
        } else {
            console.log(dryRunResult);
            return true;
        }
    }
    return false;
};
StructureSpawn.prototype.chooseBody = function(role, roomName) {
    const energyCapAvail = this.room.energyCapacityAvailable;
    const body = Array<BodyPartConstant>();
    let div = 0;
    let numCarry = 0;
    const room = Game.rooms[roomName];
    switch (role) {
        case CreepType.CREEP_CAPTURER:
            div = Math.min(2, Math.trunc(energyCapAvail / 650));
            if (Memory.rooms[roomName].controllerReserveSpots == 1) {
                div = 2;
            }
            this.addParts(body, div, CLAIM);
            this.addParts(body, div, MOVE);
            return body;
        case CreepType.CREEP_FILLER:
            div = Math.min(5, Math.trunc(energyCapAvail / 100));
            if (this.room.name == roomName && room.needsRecovery()) {
                div = 3;
            }
            this.addParts(body, div, CARRY);
            this.addParts(body, div, MOVE);
            return body;
        case CreepType.CREEP_TRANSPORTER:
            div = Math.min(10, Math.trunc(energyCapAvail / 100));
            this.addParts(body, div, CARRY);
            this.addParts(body, div, MOVE);
            return body;
        case CreepType.CREEP_TRANSFER:
            return [CARRY, MOVE];
        case CreepType.CREEP_SCOUT:
            return [MOVE];
        case CreepType.CREEP_WARRIOR:
            this.addParts(body, 2, TOUGH);
            this.addParts(body, 5, MOVE);
            this.addParts(body, 4, ATTACK);
            body.push(MOVE);
            return body;
        case CreepType.CREEP_RANGER:
            this.addParts(body, 2, TOUGH);
            this.addParts(body, 4, MOVE);
            this.addParts(body, 3, RANGED_ATTACK);
            body.push(MOVE);
            return body;
        case CreepType.CREEP_HEALER:
            this.addParts(body, 1, TOUGH);
            this.addParts(body, 2, MOVE);
            this.addParts(body, 2, HEAL);
            body.push(MOVE);
            return body;
        case CreepType.CREEP_TANK:
            this.addParts(body, 5, TOUGH);
            this.addParts(body, 6, MOVE);
            body.push(ATTACK);
            return body;
        case CreepType.CREEP_HARVESTER:
            if (this.room.name == roomName) {
                if (room.needsRecovery()) {
                    this.addParts(body, 2, WORK);
                    this.addParts(body, 1, MOVE);
                } else {
                    div = Math.min(5, Math.trunc((energyCapAvail - 100) / 100));
                    this.addParts(body, div, WORK);
                    body.push(MOVE);
                }
            } else {
                let max = 5;
                if (Memory.rooms[roomName].type == RoomType.ROOM_KEEPER_LAIR) {
                    max = 7;
                }
                div = Math.min(max, Math.trunc((energyCapAvail - 50) / 150));
                this.addParts(body, div, WORK);
                this.addParts(body, div, MOVE);
            }
            body.push(CARRY);
            return body;
        case CreepType.CREEP_MINERAL_HARVESTER:
            this.addParts(body, 5, WORK);
            this.addParts(body, 1, CARRY);
            this.addParts(body, 5, MOVE);
            return body;
        case CreepType.CREEP_BUILDER:
            if (energyCapAvail == 300) {
                return [WORK, CARRY, CARRY, MOVE, MOVE];
            } else {
                return [WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
            }
        case CreepType.CREEP_UPGRADER:
        case CreepType.CREEP_REPAIRER:
            numCarry = 1;
            if (energyCapAvail >= 500) {
                numCarry = 2;
            }
            div = Math.min(5, Math.trunc((energyCapAvail - numCarry * 100) / 150));
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
