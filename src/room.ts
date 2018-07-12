import {ATTACKER_PARTS, CreepType, FlagType, RESERVATION_MAX, RESERVATION_MIN, RoomState, RoomType} from "shared";
Room.prototype.run = function() {
    this.setupMem();
    switch (this.memory.state) {
        case RoomState.Startup:
            if (this.isMine()) {
                if (!this.needsRecovery()) {
                    this.memory.state = RoomState.Normal;
                }
            } else {
                if (this.memory.type == RoomType.EXPANSION) {
                    this.memory.state = RoomState.Normal;
                }
            }
            break;
        case RoomState.Normal:
            if (this.shouldBuild()) {
                this.buildInfra();
                this.memory.state = RoomState.Building;
            } else if (this.memory.type == RoomType.EXPANSION && this.controller != null
                && (this.controller.reservation == null || this.controller.reservation.ticksToEnd < RESERVATION_MIN)) {
                this.memory.state = RoomState.Reserving;
            }
            break;
        case RoomState.Building:
            if (this.doneBuilding()) {
                this.memory.state = RoomState.Normal;
            }
            break;
        case RoomState.Reserving:
            if (this.controller != null && this.controller.reservation != null
                && this.controller.reservation.ticksToEnd > RESERVATION_MAX) {
                this.memory.state = RoomState.Normal;
            }
            break;
        // case RoomState.Claiming:
    }
    if (this.isMine() && this.storage != null && !this.memory.addedNearbyRooms) {
        const exits = Game.map.describeExits(this.name);
        for (const dir of [TOP, RIGHT, BOTTOM, LEFT]) {
            const exit = exits[dir];
            if (exit != null) {
                Memory.config.rooms.push(exit);
            }
        }
        this.memory.addedNearbyRooms = true;
    }
    const spawns = this.find<StructureSpawn>(FIND_MY_STRUCTURES, {filter: (t) => t.structureType == STRUCTURE_SPAWN});
    if (!_.isEmpty(spawns) && _.isEmpty(this.findIdleFlags())) {
        const result = this.createFlag(spawns[0].pos.x, spawns[0].pos.y - 3, "Idle" + this.name);
        if (_.isString(result)) {
            Memory.flags[result] = {type: FlagType.IDLE};
        } else {
            console.log("error creating flag");
        }
    }
    for (const spawn of spawns) {
        spawn.setupMem();
        spawn.run();
    }
    const towers = this.find<StructureTower>(FIND_MY_STRUCTURES, {filter: (t) => t.structureType == STRUCTURE_TOWER});
    for (const tower of towers) {
        tower.run();
    }
    const links = this.find<StructureLink>(FIND_MY_STRUCTURES, {filter: (t) => t.structureType == STRUCTURE_LINK});
    for (const link of links) {
        link.run();
    }
    // if(this.isMine()) {
    //     let road = _.head(this.find(FIND_STRUCTURES, {filter: (s) => {
    //         return s.structureType == STRUCTURE_ROAD
    //             && s.pos.lookFor(LOOK_TERRAIN) == 'plain';
    //     }}));
    //     if(road != null) {
    //         road.destroy();
    //     }
    // }
};
Room.prototype.setupMem = function() {
    if (!this.isMine() && this.memory.type == null) {
        if (this.isKeeperLairRoom()) {
            this.memory.type = RoomType.KEEPER_LAIR;
        } else if (this.isUnowned()) {
            this.memory.type = RoomType.EXPANSION;
        }
    }
    if (this.controller != null && this.memory.numReserveSpots == null) {
        this.memory.numReserveSpots = this.controller.reserveSpots();
    }
};
Room.prototype.shouldBuild = function() {
    const sources = this.find(FIND_SOURCES);
    for (const source of sources) {
        if (!source.hasContainer()) {
            return true;
        }
    }
    const spawns = this.find<StructureSpawn>(FIND_MY_STRUCTURES, {filter: (t) => t.structureType == STRUCTURE_SPAWN});
    for (const spawn of spawns) {
        if (!spawn.memory.initRoad) {
            return true;
        }
        for (const source of sources) {
            if (!spawn.memory.roadTo[source.id]) {
                return true;
            }
        }
        if (this.controller && !spawn.memory.roadTo[this.controller.id]) {
            return true;
        }
        const exits = Game.map.describeExits(this.name);
        for (const dir of [TOP, RIGHT, BOTTOM, LEFT]) {
            const exit = exits[dir];
            if (exit != null && !spawn.memory.roadTo[exit]) {
                return true;
            }
        }
    }
    return false;
};
Room.prototype.buildInfra = function() {
    let objectBuilt = false;
    // build containers for sources
    const sources = this.find(FIND_SOURCES);
    for (const source of sources) {
        if (!source.hasContainer()) {
            const result = source.findContainerSpot().createConstructionSite(STRUCTURE_CONTAINER);
            if (result != OK) {
                console.log(`error creating container construction site: ${result}`);
            } else {
                objectBuilt = true;
                source._hasContainer = true;
            }
        }
    }
    if (objectBuilt) {
        return;
    }
    // build roads
    const spawns = this.find<StructureSpawn>(FIND_MY_STRUCTURES, {filter: (t) => t.structureType == STRUCTURE_SPAWN});
    for (const spawn of spawns) {
        for (const source of sources) {
            if (!spawn.memory.roadTo[source.id] && source.hasContainer()) {
                console.log(`building road to source ${source.id}`);
                const path = spawn.pos.findPathTo(source.pos, {range: 1});
                for (const val of path) {
                    this.createConstructionSite(val.x, val.y, STRUCTURE_ROAD);
                }
                objectBuilt = true;
                spawn.memory.roadTo[source.id] = true;
            }
        }
        if (this.controller && !spawn.memory.roadTo[this.controller.id]) {
            console.log(`building road to controller`);
            const path = spawn.pos.findPathTo(this.controller.pos, {range: 1});
            for (const val of path) {
                this.createConstructionSite(val.x, val.y, STRUCTURE_ROAD);
            }
            objectBuilt = true;
            spawn.memory.roadTo[this.controller.id] = true;
        }
        if (!spawn.memory.initRoad) {
            this.createConstructionSite(spawn.pos.x - 1, spawn.pos.y, STRUCTURE_ROAD);
            this.createConstructionSite(spawn.pos.x + 1, spawn.pos.y, STRUCTURE_ROAD);
            this.createConstructionSite(spawn.pos.x, spawn.pos.y - 1, STRUCTURE_ROAD);
            this.createConstructionSite(spawn.pos.x, spawn.pos.y + 1, STRUCTURE_ROAD);
            objectBuilt = true;
            spawn.memory.initRoad = true;
        }
        const exits = Game.map.describeExits(this.name);
        for (const dir of [TOP, RIGHT, BOTTOM, LEFT]) {
            const exit = exits[dir];
            if (exit != null && !spawn.memory.roadTo[exit]) {
                const path = spawn.pos.findPathTo(new RoomPosition(24, 24, exit));
                for (const val of path) {
                    this.createConstructionSite(val.x, val.y, STRUCTURE_ROAD);
                }
                objectBuilt = true;
                spawn.memory.roadTo[exit] = true;
            }
        }
    }
    if (objectBuilt) {
        return;
    }
    // build extensions
    const extCount = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTENSION}).length;
    if (this.controller && extCount < CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][this.controller.level]) {
        // build extension
    }
};
Room.prototype.doneBuilding = function() {
    return this.find(FIND_MY_CONSTRUCTION_SITES).length == 0;
};
Room.prototype.shouldClaim = function() {
    return this.memory.state == RoomState.Claiming;
};
Room.prototype.needsRecovery = function() {
    const harvesters = _.filter(Game.creeps, (c) => c.memory.role == CreepType.HARVESTER && c.memory.room == this.name)
        .length;
    const fillers = _.filter(Game.creeps, (c) => c.memory.role == CreepType.FILLER && c.memory.room == this.name)
        .length;
    return harvesters == 0 || fillers == 0;
};
Room.prototype.isMine = function() {
    return this.controller != null && this.controller.my;
};
Room.prototype.isUnowned = function() {
    return this.controller != null && this.controller.owner == null;
};
Room.prototype.isKeeperLairRoom = function() {
    return this.find(FIND_STRUCTURES, {filter: (t) => t.structureType == STRUCTURE_KEEPER_LAIR}).length > 0;
};
Room.prototype.hasHostileAttacker = function() {
    if (this._hostileAttacker == null) {
        const targets = this.find(FIND_HOSTILE_CREEPS,
            {filter: (t) => t.body.filter((p) => ATTACKER_PARTS.has(p.type)).length > 0});
        this._hostileAttacker = !_.isEmpty(targets);
    }
    return this._hostileAttacker;
};
Room.prototype.hasHurtCreep = function() {
    if (this._hurtCreep == null) {
        this._hurtCreep = this.find(FIND_MY_CREEPS, {filter: (t) => t.hits < t.hitsMax}).length > 0;
    }
    return this._hurtCreep;
};
Room.prototype.containerCount = function() {
    if (this._containerCount == null) {
        this._containerCount = this.find(FIND_STRUCTURES, {
            filter: (t) => t.structureType == STRUCTURE_CONTAINER
                && !_.includes(Memory.config.blacklist[this.name], t.id) && !t.isHostileNearby()
        }).length;
    }
    return this._containerCount;
};
Room.prototype.hasTower = function() {
    if (this._hasTower == null) {
        this._hasTower = this.find(FIND_MY_STRUCTURES, {filter: (t) => t.structureType == STRUCTURE_TOWER}).length > 0;
    }
    return this._hasTower;
};
Room.prototype.hasSpawn = function() {
    if (this._hasSpawn == null) {
        this._hasSpawn = this.find(FIND_MY_STRUCTURES, {filter: (t) => t.structureType == STRUCTURE_SPAWN}).length > 0;
    }
    return this._hasSpawn;
};
Room.prototype.findConstructionSites = function(types) {
    if (types == null) {
        return this.find(FIND_MY_CONSTRUCTION_SITES, {filter: (t) => !t.isHostileNearby()});
    } else {
        return this.find(FIND_MY_CONSTRUCTION_SITES,
            {filter: (t) => _.includes(types, t.structureType) && !t.isHostileNearby()});
    }
};
Room.prototype.findNotFullContainers = function() {
    return this.find<StructureContainer>(FIND_STRUCTURES,
        {filter: (t) => t.structureType == STRUCTURE_CONTAINER && t.store[RESOURCE_ENERGY] < t.storeCapacity});
};
Room.prototype.findNotEmptyContainers = function() {
    return this.find<StructureContainer>(FIND_STRUCTURES,
        {filter: (t) => t.structureType == STRUCTURE_CONTAINER && t.store[RESOURCE_ENERGY] > 0});
};
Room.prototype.findNotEmptyLinks = function() {
    return this.find<StructureLink>(FIND_MY_STRUCTURES,
        {filter: (t) => t.structureType == STRUCTURE_LINK && t.energy > 0 && !Memory.links[t.id].nearSource});
};
Room.prototype.isStorageNotFull = function() {
    return this.storage != null && this.storage.store[RESOURCE_ENERGY] < this.storage.storeCapacity;
};
Room.prototype.isStorageNotEmpty = function() {
    return this.storage != null && this.storage.store[RESOURCE_ENERGY] > 0;
};
Room.prototype.findSourcesForTank = function() {
    return this.find(FIND_SOURCES, {filter: (t) => !_.includes(Memory.config.blacklist[this.name], t.id)});
};
Room.prototype.findSourcesForHarvester = function() {
    return this.find(FIND_SOURCES,
        {filter: (t) => t.needsHarvester() && !_.includes(Memory.config.blacklist[this.name], t.id)});
};
Room.prototype.findExtractorForHarvester = function() {
    return _.head(this.find<StructureExtractor>(FIND_MY_STRUCTURES,
        {filter: (t) => t.structureType == STRUCTURE_EXTRACTOR}));
};
Room.prototype.checkNeedHarvester = function() {
    return this.findSourcesForHarvester().length > 0;
};
Room.prototype.findIdleFlags = function() {
    return this.find(FIND_FLAGS, {filter: (f) => f.isIdle()});
};
Room.prototype.getDistanceToRoom = function(otherRoom) {
    let name = null;
    if (_.isString(otherRoom)) {
        name = otherRoom;
    } else {
        name = otherRoom.name;
    }
    let distance = this.memory.distance[name];
    if (distance == null) {
        const route = Game.map.findRoute(this, name);
        if (route != ERR_NO_PATH) {
            distance = route.length;
        }
        this.memory.distance[name] = distance;
    }
    return distance;
};
Room.prototype.isNearTo = function(otherRoom) {
    return this.getDistanceToRoom(otherRoom) < 3;
};
