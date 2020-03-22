import { CREEPS_WARLIKE, FlagType } from "shared";
Flag.prototype.isIdle = function () {
  return this.memory.type == FlagType.IDLE;
};
Flag.prototype.isRally = function (toRoom) {
  return this.memory.type == FlagType.RALLY && this.memory.toRoom == toRoom;
};
Flag.prototype.hasRallyGroup = function () {
  const creeps = this.pos.findInRange(FIND_MY_CREEPS, 1, { filter: (t) => CREEPS_WARLIKE.includes(t.memory.role) });
  return creeps.length == 5;
};
