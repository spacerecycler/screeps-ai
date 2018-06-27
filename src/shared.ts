export const enum CreepType {
    CREEP_HARVESTER = "harvester",
    CREEP_UPGRADER = "upgrader",
    CREEP_BUILDER = "builder",
    CREEP_REPAIRER = "repairer",
    CREEP_CAPTURER = "capturer",
    CREEP_FILLER = "filler",
    CREEP_TRANSPORTER = "transporter",
    CREEP_TRANSFER = "transfer",
    CREEP_SCOUT = "scout",
    CREEP_WARRIOR = "warrior",
    CREEP_RANGER = "ranger",
    CREEP_HEALER = "healer",
    CREEP_TANK = "tank",
    CREEP_MINERAL_HARVESTER = "mineralHarvester"
}
export const enum FlagType {
    FLAG_IDLE = "idle",
    FLAG_RALLY = "rally"
}
export const enum RoomType {
    ROOM_EXPANSION = "expansion",
    ROOM_KEEPER_LAIR = "keeperLair"
}

export const CREEPS_WARLIKE = ["warrior", "ranger", "healer", "tank"];
export const RESERVATION_MIN = 1000;
export const RESERVATION_MAX = 2000;
export const ATTACKER_PARTS = new Set<BodyPartConstant>([RANGED_ATTACK, ATTACK, CLAIM]);

export type RoomTypeConstant = "expansion" | "keeperLair";
export type FlagTypeConstant = "idle" | "rally";
export type CreepTypeConstant = "harvester" | "upgrader" | "builder" | "repairer" |
    "capturer" | "filler" | "transporter" | "transfer" |
    "scout" | "warrior" | "ranger" | "healer" | "tank" | "mineralHarvester";
export type WarlikeCreepTypes = "warrior" | "ranger" | "healer" | "tank";
export type AttackerBodyParts = RANGED_ATTACK | ATTACK | CLAIM;
