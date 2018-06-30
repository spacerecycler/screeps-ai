import { CreepType } from "shared";
Source.prototype.harvestSpots = function() {
    if (this._harvestSpots == null) {
        const tiles = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y - 1, this.pos.x - 1,
            this.pos.y + 1, this.pos.x + 1, true).filter((tile) => tile.terrain != "wall");
        this._harvestSpots = tiles.length;
    }
    return this._harvestSpots;
};
Source.prototype.needsHarvester = function() {
    const creeps = _.filter(Game.creeps, (creep) => {
        return creep.memory != null && creep.memory.role == CreepType.HARVESTER
            && creep.memory.targetSource == this.id;
    });
    let workParts = 0;
    for (const creep of creeps) {
        workParts += creep.memory.numWorkParts;
    }
    return !this.isHostileNearby() && workParts < 5 && _.size(creeps) < this.harvestSpots();
};
Source.prototype.findContainerSpot = function() {
    const tiles = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y - 1, this.pos.x - 1,
        this.pos.y + 1, this.pos.x + 1, true).filter((tile) => tile.terrain != "wall");
    if (tiles.length == 1) {
        return new RoomPosition(tiles[0].x, tiles[0].y, this.room.name);
    } else {
        let x = 0;
        let y = 0;
        for (const tile of tiles) {
            x += tile.x;
            y += tile.y;
        }
        x /= tiles.length;
        y /= tiles.length;
        if (tiles.length < 5) {
            x = Math.round(x);
            y = Math.round(y);
        } else {
            x = Math.ceil(x);
            y = Math.ceil(y);
        }
        return new RoomPosition(x, y, this.room.name);
    }
};
Source.prototype.hasContainer = function() {
    if (this._hasContainer == null) {
        const containers = this.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 1,
            { filter: (t) => t.structureType == STRUCTURE_CONTAINER});
        const sites = this.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1,
            {filter: (t: ConstructionSite) => t.structureType == STRUCTURE_CONTAINER});
        this._hasContainer = containers.length > 0 || sites.length > 0;
    }
    return this._hasContainer;
};
Source.prototype.getEnergy = function() {
    return this.energy;
};
Source.prototype.doGiveEnergy = function(creep) {
    return creep.harvest(this);
};
