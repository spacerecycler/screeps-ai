StructureTerminal.prototype.calculate = function(amt, dist) {
    return amt * (1 - .1 * dist);
};
