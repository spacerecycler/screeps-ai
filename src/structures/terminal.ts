StructureTerminal.prototype.calculate = (amt, dist) => {
  return amt * (1 - 0.1 * dist);
};
