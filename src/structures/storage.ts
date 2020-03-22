StructureStorage.prototype.getEnergy = function () {
  return this.store[RESOURCE_ENERGY];
};
StructureStorage.prototype.doGiveEnergy = function (creep) {
  return creep.withdraw(this, RESOURCE_ENERGY);
};
