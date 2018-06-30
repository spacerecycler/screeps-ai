Creep.prototype.runRanger = function() {
    if (!this.memory.ready) {
        this.memory.ready = true;
    }
    const source = Game.getObjectById<Source>(this.memory.targetSource);
    if (source != null) {
        const target = _.head(source.findNearbyHostile());
        if (target != null) {
            if (this.pos.inRangeTo(target, 3)) {
                this.rangedAttack(target);
            } else {
                this.moveToS(target);
            }
        } else {
            this.idle();
        }
    } else {
        const target = this.pos.findNearestAttacker();
        if (target != null) {
            if (this.pos.inRangeTo(target, 3)) {
                this.rangedAttack(target);
            } else {
                this.moveToI(target);
            }
        } else {
            this.idle();
        }
    }
};
