Creep.prototype.runUpgrader = function() {
    const target = this.room.controller;
    if (target == null) {
        return;
    }
    if (this.upgradeController(target) == ERR_NOT_IN_RANGE) {
        this.moveToI(target);
    }
};
