// Scout: Used to find out information on target room and then suicide
Creep.prototype.runScout = function() {
  const [target] = this.room.find(FIND_SOURCES);
  if (!this.pos.isNearTo(target)) {
    this.moveToI(target);
  } else {
    this.suicide();
  }
  return false;
};
