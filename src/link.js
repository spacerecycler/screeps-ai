StructureLink.prototype.run = function() {
    if(Memory.links[this.id] == null) {
        Memory.links[this.id] = {};
    }
    if(Memory.links[this.id].nearSource == null) {
        let source = this.pos.findClosestByRange(FIND_SOURCES);
        Memory.links[this.id].nearSource = this.pos.inRangeTo(source, 2);
    }
    if(this.cooldown <= 0 && this.energy >= this.energyCapacity*0.9) {
        let links = this.room.find(FIND_MY_STRUCTURES, {
            filter: (t) => {
                return t.structureType == STRUCTURE_LINK
                    && Memory.links[t.id] != null
                    && !Memory.links[t.id].nearSource
                    && t.energy < t.energyCapacity;
            }
        });
        if(!_.isEmpty(links)) {
            let link = links[0];
            this.transferEnergy(link);
        }
    }
};
