declare module "screeps-profiler" {
    export function wrap(callback: () => void): () => void;
    export function enable(): void;
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
    blacklist: { [index: string]: string[] };
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
    exit?: RoomPosition;
}
interface FlagMemory {
    type?: FlagTypeConstant;
    toRoom?: string;
}
interface RoomMemory {
    wallsMax: number;
    distance: {};
    type?: RoomTypeConstant;
    needReserve: boolean;
    controllerReserveSpots?: number;
    shouldClaim?: boolean;
}
interface SpawnMemory {
    roadsToSources?: boolean;
}
interface TowerMemory { }
interface LinkMemory {
    nearSource: boolean;
}

interface Flag {
    isIdle(): boolean;
    isRally(toRoom: string): boolean;
    hasRallyGroup(): boolean;
}
interface Resource {
    getEnergy(): number;
}
interface RoomObject {
    projectedEnergy?: number;
    tryRepair(mem: any): {};
    doRepair?(target: {}): void;
    findNearbyHostile(): Creep[];
    isHostileNearby(): boolean;
    getEnergy(): number;
    getProjectedEnergy(): number;
    giveEnergy(creep: Creep): number;
    doGiveEnergy(creep: Creep): ScreepsReturnCode;
}
interface RoomPosition {
    findNearestAttacker(): Creep | null;
    findNearestHurtCreep(roles?: string[]): Creep;
    findNearestHurtStructure(types?: string[]): Structure;
    findNearestConstructionSite(types?: string[]): ConstructionSite;
    findNearestFillTarget(types: string[]): AnyStructure;
    findNearestNotFullLink(): AnyOwnedStructure;
    findNearestNotEmptyLink(): AnyOwnedStructure;
    findNearestNotFullContainer(): AnyStructure;
    findNearbyNotFullContainer(): AnyStructure;
    findNearestNotEmptyContainer(): AnyStructure;
    findNearestIdleFlag(): Flag;
    findNearestWall(): AnyStructure;
}
interface Room {
    run(): void;
    setupMem(): void;
    needsRecovery(): boolean;
    isMine(): boolean;
    isKeeperLairRoom(): boolean;
    hasHostileAttacker(): boolean;
    hasHurtCreep(): boolean;
    getContainerCount(): number;
    hasTower(): boolean;
    hasSpawn(): boolean;
    findConstructionSites(): ConstructionSite[];
    findNotFullContainers(): StructureContainer;
    findNotEmptyContainers(): StructureContainer;
    findNotEmptyLinks(): StructureLink;
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
    harvestSpots?: number;
    countHarvestSpots(): number;
    needsHarvester(): boolean;
    getEnergy(): number;
}
interface Creep {
    run(): void;
    setupMem(): void;
    ensureRoom(): void;
    isCreepWorking(): boolean;
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
    moveToI(target: {}): CreepMoveReturnCode;
    moveToS(target: {}): CreepMoveReturnCode;
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
    reserveSpots?: number;
    countReserveSpots(): number;
}
interface StructureSpawn {
    run(): void;
    spawnMissingCreep(roomName: string): boolean;
    getExpectedCreeps(roomName: string): Map<string, number>;
    doSpawnCreep(roomName: string, role: string, count: number): boolean;
    chooseBody(role: string, roomName: string): BodyPartConstant[];
    addParts(body: BodyPartConstant[], times: number, part: BodyPartConstant): void;
    getRandomName(): string;
}
