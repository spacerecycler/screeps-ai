Resource.prototype.getEnergy = function() {
    return this.amount;
};
StructureContainer.prototype.doGiveEnergy = function(creep) {
    return creep.pickup(this);
};
