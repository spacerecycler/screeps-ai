'use strict';
Resource.prototype.getEnergy = function() {
    return this.amount;
};
Resource.prototype.doGiveEnergy = function(creep) {
    return creep.pickup(this);
};
