StructureTerminal.prototype.calculate = (amt, dist) => {
    return amt * (1 - .1 * dist);
};
