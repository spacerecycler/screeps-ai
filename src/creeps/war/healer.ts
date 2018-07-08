import { CreepType } from "shared";
// Healer: Heals creeps
Creep.prototype.runHealer = function() {
    if (this.hits < this.hitsMax * 0.9) {
        this.heal(this);
    }
    let target = this.pos.findNearestHurtCreep([CreepType.TANK]);
    if (target == null) {
        target = this.pos.findNearestHurtCreep([CreepType.RANGER, CreepType.WARRIOR]);
    }
    if (target == null) {
        target = this.pos.findNearestHurtCreep();
    }
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            this.heal(target);
        } else {
            this.rangedHeal(target);
            this.moveToI(target);
        }
    } else {
        this.idle();
    }
};
