let sh = {
    CREEP_HARVESTER: 'harvester',
    CREEP_UPGRADER: 'upgrader',
    CREEP_BUILDER: 'builder',
    CREEP_REPAIRER: 'repairer',
    CREEP_CAPTURER: 'capturer',
    CREEP_FILLER: 'filler',
    CREEP_TRANSPORTER: 'transporter',
    CREEP_SCOUT: 'scout',
    CREEP_DEFENDER: 'defender',
    FLAG_IDLE: 'idle',
    ROOM_EXPANSION: 'expansion',
    ROOM_KEEPER_LAIR: 'keeperLair',
    reservationMin: 1000,
    reservationMax: 2000,
    ATTACKER_PARTS: new Set([RANGED_ATTACK,ATTACK,CLAIM]),
    tryRepair: function(obj, mem) {
        let target = Game.getObjectById(mem.targetId);
        // logic below to only repair things when they are 90% damaged
        // also cap hitpoints for walls since they have so many
        if(target != null) {
            let max = target.hitsMax;
            if(_.includes([STRUCTURE_WALL,STRUCTURE_RAMPART], target.structureType)) {
                max = Math.min(target.hitsMax, Memory.config.wallsMax);
            }
            if(target.hits >= max) {
                delete mem.targetId;
                target = null;
            }
        }
        if(target == null) {
            target = obj.pos.findNearestHurtStructure();
            if(target != null) {
                mem.targetId = target.id;
            }
        }
        if(target != null) {
            obj.doRepair(target);
        }
        return target;
    }
};
module.exports = sh;
