StructureController.prototype.reserveSpots = function() {
    if (this._reserveSpots == null) {
        let count = 0;
        const tiles = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y - 1, this.pos.x - 1,
            this.pos.y + 1, this.pos.x + 1, true);
        for (const tile of tiles) {
            if (tile.terrain != "wall") {
                count++;
            }
        }
        this._reserveSpots = count;
    }
    return this._reserveSpots;
};
