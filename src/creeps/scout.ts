Creep.prototype.runScout = function() {
    const targets = this.room.find(FIND_SOURCES);
    const target = _.head(targets);
    if (!this.pos.isNearTo(target)) {
        this.moveToI(target);
    } else {
        this.suicide();
    }
};
