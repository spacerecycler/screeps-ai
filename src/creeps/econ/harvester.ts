// Harvester: Harvests energy from pre-determined source
Creep.prototype.harvestEnergy = function() {
    const targetSource = Game.getObjectById<Source>(this.memory.targetSource);
    if (targetSource != null) {
        if (this.pos.isNearTo(targetSource)) {
            let energyTaken = 0;
            this.say("harvesting");
            if (this.harvest(targetSource) == OK) {
                energyTaken = Math.min(this.memory.numWorkParts * HARVEST_POWER, targetSource.energy);
                // targetSource.energy -= energyTaken;
            }
            if (this.carry[RESOURCE_ENERGY] + energyTaken >= this.carryCapacity) {
                return true;
            }
        } else {
            if (this.moveToI(targetSource) != OK) {
                this.dismantleNearestWall();
            }
        }
    }
    return false;
};
Creep.prototype.runHarvester = function() {
    const targetSource = Game.getObjectById<Source>(this.memory.targetSource);
    if (targetSource != null) {
        let target = null;
        this.say("filling");
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
            target = _.head(targetSource.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2));
            if (target != null) {
                if (this.pos.isNearTo(target)) {
                    this.build(target);
                } else {
                    this.moveToI(target);
                }
                return;
            }
            this.say("idle");
        }
    }
};
