StructureController.prototype.reserveSpots = function() {
  if (this._reserveSpots == null) {
    const tiles = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y - 1, this.pos.x - 1,
      this.pos.y + 1, this.pos.x + 1, true).filter((tile) => tile.terrain != "wall");
    this._reserveSpots = tiles.length;
  }
  return this._reserveSpots;
};
