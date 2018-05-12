StructureLink.prototype.run = function() {
    if (Memory.links[this.id] == null) {
        const source = this.pos.findClosestByRange(FIND_SOURCES);
        const isNearSource = this.pos.inRangeTo(source, 2);
        Memory.links[this.id] = {
            nearSource: isNearSource
        } as LinkMemory;
    }
    if (this.cooldown <= 0 && this.energy >= this.energyCapacity * 0.9) {
        const links = this.room.find(FIND_MY_STRUCTURES, {
            filter: (t) => {
                return t.structureType == STRUCTURE_LINK
                    && Memory.links[t.id] != null
                    && !Memory.links[t.id].nearSource
                    && t.energy < t.energyCapacity;
            }
        });
        if (!_.isEmpty(links)) {
            const link = links[0];
            this.transferEnergy(link);
        }
    }
};
StructureLink.prototype.getEnergy = function() {
    return this.energy;
};
StructureLink.prototype.doGiveEnergy = function(creep) {
    return creep.withdraw(this, RESOURCE_ENERGY);
};