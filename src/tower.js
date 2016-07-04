var sh = require('shared');
StructureTower.prototype.run = function() {
    var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(closestHostile != null) {
        this.attack(closestHostile);
        return;
    }
    var damagedCreep = this.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: (target) => target.hits < target.hitsMax
    });
    if(damagedCreep != null) {
        this.heal(damagedCreep);
        return;
    }
    this.tryRepair();
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
