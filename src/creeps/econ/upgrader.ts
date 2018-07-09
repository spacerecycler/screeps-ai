// Upgrader: Upgrades the controller in it's home room
Creep.prototype.runUpgrader = function() {
    const target = this.room.controller;
    if (target == null) {
        return;
    }
    this.say("upgrading");
    if (this.upgradeController(target) == ERR_NOT_IN_RANGE) {
        this.moveToI(target);
    }
};
