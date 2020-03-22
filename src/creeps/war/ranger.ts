// Ranger: Ranged attack unit
Creep.prototype.runRanger = function () {
  let source = null;
  if (this.memory.targetSource !== undefined) {
    source = Game.getObjectById(this.memory.targetSource);
  }
  if (source != null) {
    const [target] = source.findNearbyHostile();
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
  return false;
};
