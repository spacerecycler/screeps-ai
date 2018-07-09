// Upgrader: Upgrades the controller in it's home room
Creep.prototype.runUpgrader = function() {
    const target = this.room.controller;
    if (target == null) {
        console.log(`Room missing controller ${this.room.name}`);
        return false;
    }
    this.say("upgrading");
    if (this.pos.inRangeTo(target.pos, 3)) {
        this.upgradeController(target);
        if (this.carry[RESOURCE_ENERGY] - this.memory.numWorkParts <= 0) {
            return true;
        }
    } else {
        this.moveToI(target);
    }
    return false;
};
