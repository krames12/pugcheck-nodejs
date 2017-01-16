const _ = require('lodash');

const classMap = {
  1: "warrior",
  2: "paladin",
  3: "hunter",
  4: "rogue",
  5: "priest",
  6: "death-knight",
  7: "shaman",
  8: "mage",
  9: "warlock",
  10: "monk",
  11: "druid",
  12: "demon-hunter"
};

const lookupClassName = classId => {
  return classMap[classId];
}

const lookupClassId = className => {
  const classIdString = _.invert(classMap)[className];
  return parseInt(classIdString, 10);
};


const bossMap = {
  // Emerald Nightmare
  "Nythendra": 1853,
  "Il'gynoth, Heart of Corruption": 1873,
  "Elerethe Renferal": 1876,
  "Ursoc": 1841,
  "Dragons of Nightmare": 1854,
  "Cenarius": 1877,
  "Xavius": 1864,
  
  // Trial of Valor
  "Odyn": 1958,
  "Guarm": 1962,
  "Helya": 2008,
  
  // The Nighthold
  "Skorpyron": 1849,
  "Chronomatic Anomaly": 1865,
  "Trilliax": 1867,
  "Spellblade Aluriel": 1871,
  "Tichondrius": 1862,
  "Star Augur Etraeus": 1863,
  "Krosus": 1842,
  "High Botanist Tel'arn": 1886,
  "Grand Magistrix Elisande": 1872,
  "Gul'dan": 1866
};

const lookupBossId = bossName => {
  return bossMap[bossName];
};

const lookupBossName = bossId => {
  return _.invert(bossMap)[bossId];
}

module.exports = {
  classMap,
  lookupClassId,
  lookupClassName,
  bossMap,
  lookupBossName,
  lookupBossId
};
