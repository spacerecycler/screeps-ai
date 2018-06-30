declare module "haikunator" {
    class Haikunator {
        constructor(options?: {adjectives?: [string], nouns?: [string], seed?: any,
            defaults?: {delimiter?: string, tokenLength?: number, tokenHex?: boolean, tokenChars?: string}})
        public haikunate(options?: {delimiter?: string, tokenLength?: number, tokenHex?: boolean,
            tokenChars?: string}): string;
    }
    export = Haikunator;
}
interface Memory {
    testing: boolean;
    config: ConfigMemory;
    towers: { [name: string]: TowerMemory };
    links: { [name: string]: LinkMemory };
    vars: VarsMemory;
}
interface ConfigMemory {
    canClaim: boolean;
    rooms: string[];
    blacklist: { [roomName: string]: string[] };
}
interface VarsMemory {
    lastPct?: string;
}
interface CreepMemory {
    role: CreepTypeConstant;
    room: string;
    numWorkParts: number;
    targetSource?: string;
    targetExtractor?: string;
    targetMineral?: string;
    targetId?: string;
    energyTarget?: string;
    shouldFillTower?: boolean;
    ready?: boolean;
    working?: boolean;
    _move?: any;
}
interface FlagMemory {
    type?: FlagTypeConstant;
    toRoom?: string;
}
interface RoomMemory {
    wallsMax: number;
    distance: { [roomName: string]: number };
    type?: RoomTypeConstant;
    needReserve?: boolean;
    controllerReserveSpots?: number;
    shouldClaim?: boolean;
}
interface SpawnMemory {
    roadsToSources?: boolean;
}
interface TowerMemory {
    targetId?: string;
}
interface LinkMemory {
    nearSource: boolean;
}
interface Flag {
    isIdle(): boolean;
    isRally(toRoom: string): boolean;
    hasRallyGroup(): boolean;
}
interface RoomObject {
    _projectedEnergy?: number;
    projectedEnergy(): number;
    tryRepair(mem: CreepMemory | TowerMemory): Structure | null;
    doRepair(target: Structure): void;
    findNearbyHostile(): Creep[];
    isHostileNearby(): boolean;
    getEnergy(): number;
    giveEnergy(creep: Creep): number;
    doGiveEnergy(creep: Creep): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_ENOUGH_RESOURCES | ERR_INVALID_TARGET |
        ERR_FULL | ERR_NOT_IN_RANGE | ERR_INVALID_ARGS | ERR_TIRED | ERR_NO_BODYPART | ERR_NOT_FOUND;
}
interface RoomPosition {
    findNearestAttacker(): Creep | null;
    findNearestHurtCreep(roles?: CreepTypeConstant[]): Creep | null;
    findNearestHurtStructure(types?: StructureConstant[]): Structure | null;
    findNearestConstructionSite(types?: StructureConstant[]): ConstructionSite | null;
    findNearestFillTarget(type: FillTargetConstants): FillTarget | null;
    findNearestNotFullLink(): StructureLink | null;
    findNearestNotEmptyLink(): StructureLink | null;
    findNearestNotFullContainer(): StructureContainer | null;
    findNearbyNotFullContainer(): StructureContainer | null;
    findNearestNotEmptyContainer(): StructureContainer | null;
    findNearestIdleFlag(): Flag | null;
    findNearestWall(): StructureWall | null;
}
interface Room {
    _containerCount?: number;
    _hasTower?: boolean;
    _hasSpawn?: boolean;
    _hostileAttacker?: boolean;
    _hurtCreep?: boolean;
    containerCount(): number;
    run(): void;
    setupMem(): void;
    needsRecovery(): boolean;
    isMine(): boolean;
    isKeeperLairRoom(): boolean;
    hasHostileAttacker(): boolean;
    hasHurtCreep(): boolean;
    hasTower(): boolean;
    hasSpawn(): boolean;
    findConstructionSites(types?: StructureConstant): ConstructionSite[];
    findNotFullContainers(): StructureContainer[];
    findNotEmptyContainers(): StructureContainer[];
    findNotEmptyLinks(): StructureLink[];
    isStorageNotFull(): boolean;
    isStorageNotEmpty(): boolean;
    findSourcesForTank(): Source[];
    findSourcesForHarvester(): Source[];
    findExtractorForHarvester(): StructureExtractor;
    checkNeedHarvester(): boolean;
    findIdleFlags(): Flag[];
    getDistanceToRoom(otherRoom: Room | string): number;
    isNearTo(otherRoom: Room | string): boolean;
}
interface Source {
    _harvestSpots?: number;
    _hasContainer?: boolean;
    harvestSpots(): number;
    hasContainer(): boolean;
    needsHarvester(): boolean;
    getEnergy(): number;
    findContainerSpot(): RoomPosition;
}
interface Creep {
    run(): void;
    setupMem(): void;
    ensureRoom(): void;
    isCreepWorking(): boolean | undefined;
    fillEnergy(): boolean;
    runHarvester(): void;
    runMineralHarvester(): void;
    runTransfer(): void;
    runUpgrader(): void;
    runBuilder(): void;
    runRepairer(): void;
    runCapturer(): void;
    runFiller(): void;
    runTransporter(): void;
    runScout(): void;
    runWarrior(): void;
    runRanger(): void;
    runHealer(): void;
    runTank(): void;
    moveToI(target: RoomPosition | { pos: RoomPosition }): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET
        | ERR_NOT_FOUND;
    moveToS(target: RoomPosition | { pos: RoomPosition }): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET
        | ERR_NOT_FOUND;
    idle(): void;
    rally(): boolean;
    dismantleNearestWall(): void;
}
interface StructureTower {
    run(): void;
}
interface StructureTerminal {
    calculate(amt: any, dst: any): number;
}
interface StructureLink {
    run(): void;
}
interface StructureExtractor {
    getMineral(): Mineral<MineralConstant>;
}
interface StructureController {
    _reserveSpots?: number;
    reserveSpots(): number;
}
interface StructureSpawn {
    run(): void;
    spawnMissingCreep(roomName: string): boolean;
    getExpectedCreeps(roomName: string): Map<CreepTypeConstant, number>;
    doSpawnCreep(roomName: string, role: CreepTypeConstant, count: number): boolean;
    chooseBody(role: CreepTypeConstant, roomName: string): BodyPartConstant[];
    addParts(body: BodyPartConstant[], times: number, part: BodyPartConstant): void;
    getRandomName(): string;
}
type RoomTypeConstant = "expansion" | "keeperLair";
type FlagTypeConstant = "idle" | "rally";
type CreepTypeConstant = "harvester" | "upgrader" | "builder" | "repairer" |
    "capturer" | "filler" | "transporter" | "transfer" |
    "scout" | "warrior" | "ranger" | "healer" | "tank" | "mineralHarvester";
type WarlikeCreepTypes = "warrior" | "ranger" | "healer" | "tank";
type AttackerBodyParts = RANGED_ATTACK | ATTACK | CLAIM;
type DefenseStructure = StructureWall | StructureRampart;
type FillTargetConstants = STRUCTURE_SPAWN | STRUCTURE_EXTENSION | STRUCTURE_TOWER;
type FillTarget = StructureExtension | StructureSpawn | StructureTower;
type EnergyTarget = Resource | StructureLink | StructureContainer | StructureStorage | Source | Tombstone;

// FIXES TO BE MERGED
interface Room {
    createConstructionSite(x: number, y: number, structureType: BuildableStructureConstant):
        OK | ERR_INVALID_TARGET | ERR_FULL | ERR_INVALID_ARGS | ERR_RCL_NOT_ENOUGH;
    createConstructionSite(pos: RoomPosition | _HasRoomPosition, structureType: BuildableStructureConstant):
        OK | ERR_INVALID_TARGET | ERR_FULL | ERR_INVALID_ARGS | ERR_RCL_NOT_ENOUGH;
    createConstructionSite(x: number, y: number, structureType: STRUCTURE_SPAWN, name?: string):
        OK | ERR_INVALID_TARGET | ERR_FULL | ERR_INVALID_ARGS | ERR_RCL_NOT_ENOUGH;
    createConstructionSite(pos: RoomPosition | _HasRoomPosition, structureType: STRUCTURE_SPAWN, name?: string):
        OK | ERR_INVALID_TARGET | ERR_FULL | ERR_INVALID_ARGS | ERR_RCL_NOT_ENOUGH;
}
interface RoomPosition {
    createConstructionSite(structureType: BuildableStructureConstant):
        OK | ERR_INVALID_TARGET | ERR_FULL | ERR_INVALID_ARGS | ERR_RCL_NOT_ENOUGH;
    createConstructionSite(structureType: STRUCTURE_SPAWN, name?: string):
        OK | ERR_INVALID_TARGET | ERR_FULL | ERR_INVALID_ARGS | ERR_RCL_NOT_ENOUGH;
    createFlag(name?: string, color?: ColorConstant, secondaryColor?: ColorConstant):
        ERR_NAME_EXISTS | ERR_INVALID_ARGS | string;
}
interface Creep {
    pickup(target: Resource): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_INVALID_TARGET | ERR_FULL | ERR_NOT_IN_RANGE;
    harvest(target: Source | Mineral): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_NOT_FOUND |
        ERR_NOT_ENOUGH_RESOURCES | ERR_INVALID_TARGET | ERR_NOT_IN_RANGE | ERR_NO_BODYPART;
    withdraw(target: Structure | Tombstone, resourceType: ResourceConstant, amount?: number): OK | ERR_NOT_OWNER |
        ERR_BUSY | ERR_NOT_ENOUGH_RESOURCES | ERR_INVALID_TARGET | ERR_FULL | ERR_NOT_IN_RANGE | ERR_INVALID_ARGS;
}
