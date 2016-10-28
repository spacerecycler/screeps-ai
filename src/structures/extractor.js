'use strict';
StructureExtractor.prototype.getMineral = function() {
    return _.head(this.pos.lookFor(LOOK_MINERALS));
};
