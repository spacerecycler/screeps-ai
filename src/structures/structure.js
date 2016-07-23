Structure.prototype.doGiveEnergy = function(creep) {
    return creep.withdraw(this, RESOURCE_ENERGY);
};
