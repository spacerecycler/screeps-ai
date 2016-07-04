var _ = require('lodash');
var sh = require('shared');
StructureTower.prototype.run = function() {
    var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (target) => {
            var hasAttack = false;
            _.forEach(target.body, (part) => {
                if(_.includes([RANGED_ATTACK,ATTACK], part.type)) {
                    hasAttack = true;
                    return false;
                }
            });
            return hasAttack;
        }
    });
    if(closestHostile != null) {
        if(this.attack(closestHostile) == OK) {
            return;
        }
    }
    var damagedCreep = this.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: (target) => target.hits < target.hitsMax
    });
    if(damagedCreep != null) {
        if(this.heal(damagedCreep) == OK) {
            return;
        }
    }
    if(Memory.towers[this.id] == null) {
        Memory.towers[this.id] = {};
    }
    this.doRepair(this.pos, Memory.towers[this.id], (target) => {
        this.repair(target);
    });
};
StructureTower.prototype.doRepair = sh.doRepair;
