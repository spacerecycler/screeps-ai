'use strict';
let sh = require('shared');
Flag.prototype.isIdle = function() {
    return this.memory.type == sh.FLAG_IDLE;
};
Flag.prototype.isRally = function(toRoom) {
    return this.memory.type == sh.FLAG_RALLY && this.memory.toRoom == toRoom;
};
Flag.prototype.hasRallyGroup = function() {
    let creeps = this.pos.findInRange(FIND_MY_CREEPS, 1, {filter: (t) => {
        return _.includes(sh.CREEPS_WARLIKE, t.memory.role);
    }});
    return _.size(creeps) == 5;
};
