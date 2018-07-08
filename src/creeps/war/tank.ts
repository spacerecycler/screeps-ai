// Tank: Unit designed to soak damage
Creep.prototype.runTank = function() {
    const source = Game.getObjectById<Source>(this.memory.targetSource);
    if (source == null) {
        return;
    }
    const target = _.head(source.findNearbyHostile());
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            this.attack(target);
        } else {
            this.moveToS(target);
        }
    } else {
        this.idle();
    }
};
