var sh = require('shared');
StructureTower.prototype.run = function() {
    this.tryRepair();
    // var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    // if(closestHostile) {
    //     tower.attack(closestHostile);
    // }
};
StructureTower.prototype.tryRepair = function() {
    if(Memory.towers[this.id] == null) {
        Memory.towers[this.id] = {};
    }
    this.doRepair(this.pos, Memory.towers[this.id], (target) => {
        this.repair(target);
    });
};
StructureTower.prototype.doRepair = sh.doRepair;
