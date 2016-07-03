var _ = require('lodash');
Object.apply(Room.prototype, {
    run: function() {
        var spawns = this.find(FIND_MY_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_SPAWN});
        _.forEach(spawns, (spawn) => {
            spawn.run();
        });
        var towers = this.find(FIND_MY_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_TOWER});
        _.forEach(towers, (tower) => {
            tower.run();
        });
    },
    getContainerCount: function() {
        return _.size(this.find(FIND_STRUCTURES, {
            filter: (target) => target.structureType == STRUCTURE_CONTAINER}));
    },
    getTowerCount: function() {
        return _.size(this.find(FIND_MY_STRUCTURES, {
            filter: (target) => target.structureType == STRUCTURE_TOWER}));
    }
});
