var _ = require('lodash');
var sh = require('shared');
StructureSpawn.prototype.run = function() {
    var spawnedOrMissing = false;
    _.forEach(Memory.config.rooms, (name) => {
        var room = Game.rooms[name];
        if(room != null && room.isMine()) {
            spawnedOrMissing = this.spawnMissingCreep(name);
            return !spawnedOrMissing;
        }
    });
    if(!spawnedOrMissing) {
        _.forEach(Memory.config.rooms, (name) => {
            var room = Game.rooms[name];
            if(room == null || !room.isMine()) {
                spawnedOrMissing = this.spawnMissingCreep(name);
                return !spawnedOrMissing;
            }
        });
    }
};
StructureSpawn.prototype.spawnMissingCreep = function(name) {
    var expected = this.getExpectedCreeps(name);
    var spawnedOrMissing = false;
    var room = Game.rooms[name];
    if(room != null && room.isMine()) {
        spawnedOrMissing = this.doSpawnCreep(name, sh.CREEP_HARVESTER, 1);
        if(!spawnedOrMissing) {
            spawnedOrMissing = this.doSpawnCreep(name, sh.CREEP_FILLER, 1);
        }
    }
    if(!spawnedOrMissing) {
        _.forEach(expected, (count, role) => {
            spawnedOrMissing = this.doSpawnCreep(name, role, count);
            return !spawnedOrMissing;
        });
    }
    return spawnedOrMissing;
},
StructureSpawn.prototype.getExpectedCreeps = function(name) {
    var expected = {};
    var room = Game.rooms[name];
    if(room != null) {
        var containerCount = room.getContainerCount();
        if(room.storage != null) {
            expected[sh.CREEP_HARVESTER] = room.memory.maxHarvesters;
        } else if(containerCount > 0) {
            expected[sh.CREEP_HARVESTER] = Math.min(containerCount, room.memory.maxHarvesters);
            if(!room.isMine()) {
                expected[sh.CREEP_TRANSPORTER] = Math.min(containerCount, 2);
            }
        } else {
            var structureCount = _.size(room.find(FIND_MY_STRUCTURES));
            if(structureCount > 0) {
                expected[sh.CREEP_HARVESTER] = 2;
            }
        }
        if(room.energyCapacityAvailable > 0) {
            if(room.energyCapacityAvailable > 400) {
                expected[sh.CREEP_FILLER] = 2;
            } else {
                expected[sh.CREEP_FILLER] = 1;
            }
        }
        if(room.isMine()) {
            expected[sh.CREEP_UPGRADER] = 1;
        }
        if(_.size(room.findConstructionSites()) > 0) {
            expected[sh.CREEP_BUILDER] = 1;
        }
        if(room.getTowerCount() == 0) {
            expected[sh.CREEP_REPAIRER] = 1;
        }
        if(!room.isMine()) {
            if(room.controller == null || room.controller.reservation == null) {
                room.memory.needReserve = true;
            } else {
                if(room.controller.reservation.ticksToEnd < sh.reservationMin) {
                    room.memory.needReserve = true;
                }
                if(room.controller.reservation.ticksToEnd > sh.reservationMax) {
                    room.memory.needReserve = false;
                }
            }
        }
    } else {
        expected[sh.CREEP_REPAIRER] = 1;
        Memory.rooms[name].needReserve = true;
    }
    if(Memory.rooms[name].needReserve != null) {
        if(Math.trunc(this.room.energyCapacityAvailable/650) < 2) {
            if(Memory.rooms[name].needReserve) {
                expected[sh.CREEP_CAPTURER] = 2;
            } else {
                expected[sh.CREEP_CAPTURER] = 1;
            }
        } else {
            if(Memory.rooms[name].needReserve) {
                expected[sh.CREEP_CAPTURER] = 1;
            }
        }

    }
    return expected;
};
StructureSpawn.prototype.doSpawnCreep = function(name, role, count) {
    var roomCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.room == name);
    if(_.size(roomCreeps) < count) {
        var body = this.chooseBody(role);
        if(this.canCreateCreep(body) == OK) {
            var result = this.createCreep(body, null, {
                role: role,
                room: name
            });
            if(_.isString(result)) {
                console.log('Spawning new ' + role + ' for ' + name + ': ' + result);
                return true;
            } else {
                console.log('Spawn error: ' + result);
            }
        } else {
            return true;
        }
    }
    return false;
},
StructureSpawn.prototype.chooseBody = function(role) {
    var totalCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
    var energyCapAvail = this.room.energyCapacityAvailable;
    var body = [];
    if(role == sh.CREEP_CAPTURER) {
        _.times(Math.trunc(energyCapAvail/650), () => {
            body.push(CLAIM);
            body.push(MOVE);
        });
        return body;
    }
    if(role == sh.CREEP_FILLER || role == sh.CREEP_TRANSPORTER) {
        if(role == sh.CREEP_FILLER && totalCreeps == 0) {
            return [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
        }
        var div = Math.trunc(energyCapAvail/100);
        _.times(div, () => {
            body.push(CARRY);
            body.push(MOVE);
        });
        return body;
    }
    if(role == sh.CREEP_HARVESTER && totalCreeps == 0) {
        return [WORK,WORK,CARRY,MOVE];
    }
    var parts50 = energyCapAvail/50;
    // number of 50 cost parts * 5/8 /2 = num work parts
    var numWorkParts = Math.ceil(parts50*5 /16);
    var remainingParts = parts50 - numWorkParts*2;
    _.times(numWorkParts, () => body.push(WORK));
    _.times(Math.trunc(remainingParts/2), () => {
        body.push(CARRY);
        body.push(MOVE);
    });
    if(remainingParts%2 > 0) {
        body.push(MOVE);
    }
    return body;
};
