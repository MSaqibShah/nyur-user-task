const copyFromDict = (dic, keys) => {
  const dicFinal = {};
  keys.forEach((key) => {
    dicFinal[key] = dic[key];
  });
  return dicFinal;
};

module.exports = { copyFromDict };
