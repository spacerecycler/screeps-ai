StructureExtractor.prototype.getMineral = function () {
  const [m] = this.pos.lookFor(LOOK_MINERALS);
  return m;
};
