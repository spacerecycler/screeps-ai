var sh = require('shared');
StructureTower.prototype.doRepair = function() {
    if(Memory.towers[this.id] == null) {
        Memory.towers[this.id] = {};
    }
    sh.doRepair(this.pos, Memory.towers[this.id], function(target) {
        this.repair(target);
    });
};
StructureTower.prototype.run = function() {
    this.doRepair();
    // var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    // if(closestHostile) {
    //     tower.attack(closestHostile);
    // }
};
