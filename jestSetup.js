global.structuredClone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};
