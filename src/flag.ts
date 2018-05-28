import { CREEPS_WARLIKE, FlagType } from "shared";
Flag.prototype.isIdle = function() {
    return this.memory.type == FlagType.FLAG_IDLE;
};
Flag.prototype.isRally = function(toRoom) {
    return this.memory.type == FlagType.FLAG_RALLY && this.memory.toRoom == toRoom;
};
Flag.prototype.hasRallyGroup = function() {
    const creeps = this.pos.findInRange(FIND_MY_CREEPS, 1,
        { filter: (t: Creep) => CREEPS_WARLIKE.includes(t.memory.role) });
    return creeps.length == 5;
};
