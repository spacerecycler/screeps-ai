// Capturer: Reserves or Claims controllers
Creep.prototype.runCapturer = function() {
    if (this.room.controller == null) {
        return;
    }
    if (this.pos.isNearTo(this.room.controller)) {
        if (Memory.config.canClaim && this.room.memory.shouldClaim) {
            this.claimController(this.room.controller);
            delete this.room.memory.type;
            delete this.room.memory.needReserve;
            Memory.config.canClaim = false;
        } else {
            this.reserveController(this.room.controller);
        }
    } else {
        this.moveToI(this.room.controller);
    }
};
