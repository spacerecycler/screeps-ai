export const enum CreepType {
    HARVESTER = "harvester",
    UPGRADER = "upgrader",
    BUILDER = "builder",
    REPAIRER = "repairer",
    CAPTURER = "capturer",
    FILLER = "filler",
    TRANSPORTER = "transporter",
    TRANSFER = "transfer",
    SCOUT = "scout",
    WARRIOR = "warrior",
    RANGER = "ranger",
    HEALER = "healer",
    TANK = "tank",
    MINERAL_HARVESTER = "mineralHarvester"
}
export const enum CreepState {
    Spawning = "spawning",
    Rally = "rally",
    MoveToHomeRoom = "moveToHomeRoom",
    GetResource = "getResource",
    Work = "work"
}
export const enum FlagType {
    IDLE = "idle",
    RALLY = "rally"
}
export const enum RoomType {
    EXPANSION = "expansion",
    KEEPER_LAIR = "keeperLair"
}
export const enum RoomState {
    Startup = "startup",
    Normal = "normal",
    Building = "building",
    Reserving = "reserving",
    Claiming = "claiming"
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
