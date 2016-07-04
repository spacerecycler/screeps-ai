var sh = require('shared');
StructureTower.prototype.tryRepair = sh.tryRepair;
StructureTower.prototype.doRepair = function(target) {
    this.repair(target);
};
StructureTower.prototype.run = function() {
    var target = this.pos.findNearestAttacker();
    if(target != null) {
        if(this.attack(target) == OK) {
            return;
        }
    }
    target = this.pos.findNearestHurtCreep();
    if(target != null) {
        if(this.heal(target) == OK) {
            return;
        }
    }
    if(Memory.towers[this.id] == null) {
        Memory.towers[this.id] = {};
    }
    this.tryRepair(Memory.towers[this.id]);
};
