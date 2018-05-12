Resource.prototype.getEnergy = function() {
    return this.amount;
};
Resource.prototype.doGiveEnergy = function(creep: Creep) {
    return creep.pickup(this);
};
