Creep.prototype.runMineralHarvester = function() {
    const targetExtractor = Game.getObjectById<StructureExtractor>(this.memory.targetExtractor);
    const targetMineral = Game.getObjectById<Mineral>(this.memory.targetMineral);
    if (targetExtractor == null) {
        return;
    }
    if (targetMineral == null) {
        console.log(`${this.name} error mineral`);
        return;
    }
    if (!this.isCreepWorking()) {
        if (this.pos.isNearTo(targetMineral)) {
            let mineralTaken = 0;
            if (this.harvest(targetMineral) == OK) {
                mineralTaken = Math.min(this.memory.numWorkParts * HARVEST_POWER, targetMineral.mineralAmount);
                // targetSource.energy -= energyTaken;
            }
            const curCarry = this.carry[targetMineral.mineralType];
            if (curCarry != null && curCarry + mineralTaken < this.carryCapacity) {
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
