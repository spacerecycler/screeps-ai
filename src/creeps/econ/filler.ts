// Filler: Fills objects in room that need energy from containers
Creep.prototype.runFiller = function() {
    let target = null;
    if (!this.room.hasHostileAttacker()) {
        target = this.pos.findNearestFillTarget(STRUCTURE_EXTENSION);
        if (target == null) {
            target = this.pos.findNearestFillTarget(STRUCTURE_SPAWN);
        }
    }
    if (target == null) {
        target = this.pos.findNearestFillTarget(STRUCTURE_TOWER);
    }
    if (target == null && this.room.isStorageNotFull()
        && (!_.isEmpty(this.room.findNotEmptyContainers()) || !_.isEmpty(this.room.findNotEmptyLinks()))) {
        target = this.room.storage;
    }
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            this.transfer(target, RESOURCE_ENERGY);
        } else {
            this.moveToI(target);
        }
    } else {
        this.idle();
    }
};
