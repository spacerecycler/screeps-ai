// Tank: Unit designed to soak damage
Creep.prototype.runTank = function() {
  let source = null;
  if (this.memory.targetSource !== undefined) {
    source = Game.getObjectById<Source>(this.memory.targetSource);
  }
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
