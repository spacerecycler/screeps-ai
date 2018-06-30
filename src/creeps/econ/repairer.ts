Creep.prototype.runRepairer = function() {
    let target = this.tryRepair(this.memory);
    if (target == null) {
        const objects = Memory.config.blacklist[this.room.name].map((id) => Game.getObjectById(id));
        target = _.head(objects.map((t) => t instanceof Structure ? t : null).filter((t) => t != null));
        if (target != null && this.dismantle(target) == ERR_NOT_IN_RANGE) {
            this.moveToI(target);
        }
    }
    if (target == null) {
        this.idle();
    }
};
