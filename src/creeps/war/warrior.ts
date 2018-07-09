// Warrior: Melee attack unit
Creep.prototype.runWarrior = function() {
    const source = Game.getObjectById<Source>(this.memory.targetSource);
    if (source != null) {
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
    } else {
        const target = this.pos.findNearestAttacker();
        if (target != null) {
            if (this.pos.isNearTo(target)) {
                this.attack(target);
            } else {
                this.moveToI(target);
            }
        } else {
            this.idle();
        }
    }
    return false;
};
