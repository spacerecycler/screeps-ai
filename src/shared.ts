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
export type RoomTypeConstant = RoomType.ROOM_EXPANSION | RoomType.ROOM_KEEPER_LAIR;
export type FlagTypeConstant = FlagType.FLAG_IDLE | FlagType.FLAG_RALLY;

export type CreepTypeConstant =
    CreepType.CREEP_HARVESTER |
    CreepType.CREEP_UPGRADER |
    CreepType.CREEP_BUILDER |
    CreepType.CREEP_REPAIRER |
    CreepType.CREEP_CAPTURER |
    CreepType.CREEP_FILLER |
    CreepType.CREEP_TRANSPORTER |
    CreepType.CREEP_TRANSFER |
    CreepType.CREEP_SCOUT |
    CreepType.CREEP_WARRIOR |
    CreepType.CREEP_RANGER |
    CreepType.CREEP_HEALER |
    CreepType.CREEP_TANK |
    CreepType.CREEP_MINERAL_HARVESTER;
export type WarlikeCreepTypes = CreepType.CREEP_WARRIOR | CreepType.CREEP_RANGER | CreepType.CREEP_HEALER | CreepType.CREEP_TANK;

export type AttackerBodyParts = RANGED_ATTACK | ATTACK | CLAIM;
/*
boyNames = ["Jackson", "Aiden", "Liam", "Lucas", "Noah", "Mason", "Jayden", "Ethan", "Jacob", "Jack", "Caden", "Logan", "Benjamin", "Michael", "Caleb", "Ryan", "Alexander", "Elijah", "James", "William", "Oliver", "Connor", "Matthew", "Daniel", "Luke", "Brayden", "Jayce", "Henry", "Carter", "Dylan", "Gabriel", "Joshua", "Nicholas", "Isaac", "Owen", "Nathan", "Grayson", "Eli", "Landon", "Andrew", "Max", "Samuel", "Gavin", "Wyatt", "Christian", "Hunter", "Cameron", "Evan", "Charlie", "David", "Sebastian", "Joseph", "Dominic", "Anthony", "Colton", "John", "Tyler", "Zachary", "Thomas", "Julian", "Levi", "Adam", "Isaiah", "Alex", "Aaron", "Parker", "Cooper", "Miles", "Chase", "Muhammad", "Christopher", "Blake", "Austin", "Jordan", "Leo", "Jonathan", "Adrian", "Colin", "Hudson", "Ian", "Xavier", "Camden", "Tristan", "Carson", "Jason", "Nolan", "Riley", "Lincoln", "Brody", "Bentley", "Nathaniel", "Josiah", "Declan", "Jake", "Asher", "Jeremiah", "Cole", "Mateo", "Micah", "Elliot"];
girlNames = ["Sophia", "Emma", "Olivia", "Isabella", "Mia", "Ava", "Lily", "Zoe", "Emily", "Chloe", "Layla", "Madison", "Madelyn", "Abigail", "Aubrey", "Charlotte", "Amelia", "Ella", "Kaylee", "Avery", "Aaliyah", "Hailey", "Hannah", "Addison", "Riley", "Harper", "Aria", "Arianna", "Mackenzie", "Lila", "Evelyn", "Adalyn", "Grace", "Brooklyn", "Ellie", "Anna", "Kaitlyn", "Isabelle", "Sophie", "Scarlett", "Natalie", "Leah", "Sarah", "Nora", "Mila", "Elizabeth", "Lillian", "Kylie", "Audrey", "Lucy", "Maya", "Annabelle", "Makayla", "Gabriella", "Elena", "Victoria", "Claire", "Savannah", "Peyton", "Maria", "Alaina", "Kennedy", "Stella", "Liliana", "Allison", "Samantha", "Keira", "Alyssa", "Reagan", "Molly", "Alexandra", "Violet", "Charlie", "Julia", "Sadie", "Ruby", "Eva", "Alice", "Eliana", "Taylor", "Callie", "Penelope", "Camilla", "Bailey", "Kaelyn", "Alexis", "Kayla", "Katherine", "Sydney", "Lauren", "Jasmine", "London", "Bella", "Adeline", "Caroline", "Vivian", "Juliana", "Gianna", "Skyler", "Jordyn"];
namesCombined = _.shuffle([].concat(boyNames, girlNames));
*/
