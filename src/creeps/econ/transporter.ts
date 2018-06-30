Creep.prototype.runTransporter = function() {
    let target = Game.getObjectById<StructureStorage | StructureContainer>(this.memory.targetId);
    if (target != null && target.store[RESOURCE_ENERGY] == target.storeCapacity) {
        delete this.memory.targetId;
        target = null;
    }
    if (target == null) {
        let distance = 255;
        for (const name of Memory.config.rooms) {
            const room = Game.rooms[name];
            if (room != null && room.isMine() && room.isStorageNotFull()) {
                const route = Game.map.findRoute(this.room.name, room.name);
                if (route != ERR_NO_PATH && route.length < distance) {
                    distance = route.length;
                    target = room.storage == null ? null : room.storage;
                }
            }
        }
        if (target != null) {
            this.memory.targetId = target.id;
        }
    }
    if (target == null) {
        const targets = Memory.config.rooms.map((n) => {
            const room = Game.rooms[n];
            if (room != null && room.isMine()) {
                return room.findNotFullContainers();
            } else {
                return Array<StructureContainer>();
            }
        }).reduce((a, b) => a.concat(b), []);
        let curEnergy = CONTAINER_CAPACITY;
        for (const t of targets) {
            if (t.store[RESOURCE_ENERGY] < curEnergy) {
                target = t;
                curEnergy = t.store[RESOURCE_ENERGY];
            }
        }
        if (target != null) {
            this.memory.targetId = target.id;
        }
    }
    if (target != null) {
        if (this.pos.isNearTo(target)) {
            this.transfer(target, RESOURCE_ENERGY);
        } else {
            this.moveToS(target);
        }
    }
};
