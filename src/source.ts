import { CreepType } from "shared";
Source.prototype.harvestSpots = function() {
    if (this._harvestSpots == null) {
        let count = 0;
        const tiles = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y - 1, this.pos.x - 1,
            this.pos.y + 1, this.pos.x + 1, true);
        for (const tile of tiles) {
            if (tile.terrain != "wall") {
                count++;
            }
        }
        this._harvestSpots = count;
    }
    return this._harvestSpots;
};
Source.prototype.needsHarvester = function() {
    const creeps = _.filter(Game.creeps, (creep) => {
        return creep.memory != null && creep.memory.role == CreepType.CREEP_HARVESTER
            && creep.memory.targetSource == this.id;
    });
    let workParts = 0;
    for (const creep of creeps) {
        workParts += creep.memory.numWorkParts;
    }
    return !this.isHostileNearby() && workParts < 5 && _.size(creeps) < this.harvestSpots();
};
Source.prototype.getEnergy = function() {
    return this.energy;
};
Source.prototype.doGiveEnergy = function(creep) {
    return creep.harvest(this);
};
