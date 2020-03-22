Tombstone.prototype.getEnergy = function () {
  return this.store[RESOURCE_ENERGY];
};
Tombstone.prototype.doGiveEnergy = function (creep) {
  return creep.withdraw(this, RESOURCE_ENERGY);
};
