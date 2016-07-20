let sh = {
    CREEP_HARVESTER: 'harvester',
    CREEP_UPGRADER: 'upgrader',
    CREEP_BUILDER: 'builder',
    CREEP_REPAIRER: 'repairer',
    CREEP_CAPTURER: 'capturer',
    CREEP_FILLER: 'filler',
    CREEP_TRANSPORTER: 'transporter',
    CREEP_SCOUT: 'scout',
    CREEP_WARRIOR: 'warrior',
    CREEP_RANGER: 'ranger',
    CREEP_HEALER: 'healer',
    CREEP_TANK: 'tank',
    CREEPS_WARLIKE: ['warrior','ranger','healer','tank'],
    FLAG_IDLE: 'idle',
    FLAG_RALLY: 'rally',
    FLAG_KITE: 'kite',
    ROOM_EXPANSION: 'expansion',
    ROOM_KEEPER_LAIR: 'keeperLair',
    reservationMin: 1000,
    reservationMax: 2000,
    ATTACKER_PARTS: new Set([RANGED_ATTACK,ATTACK,CLAIM])
};
module.exports = sh;
