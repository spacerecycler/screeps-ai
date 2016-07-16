StructureController.prototype.countReserveSpots = function() {
    let count = 0;
    let tiles = this.room.lookForAtArea(LOOK_TERRAIN, this.pos.y-1, this.pos.x-1, this.pos.y+1, this.pos.x+1, true);
    for(let tile of tiles) {
        if(tile.terrain != 'wall') {
            count++;
        }
    }
    return count;
};