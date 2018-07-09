// Capturer: Reserves or Claims controllers
Creep.prototype.runCapturer = function() {
    if (this.room.controller == null) {
        return;
    }
    if (this.pos.isNearTo(this.room.controller)) {
        if (this.room.shouldClaim()) {
            this.claimController(this.room.controller);
            delete this.room.memory.type;
        } else {
            this.reserveController(this.room.controller);
        }
    } else {
        this.moveToI(this.room.controller);
    }
};
