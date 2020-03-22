StructureContainer.prototype.getEnergy = function () {
  return this.store[RESOURCE_ENERGY];
};
StructureContainer.prototype.doGiveEnergy = function (creep) {
  return creep.withdraw(this, RESOURCE_ENERGY);
};
