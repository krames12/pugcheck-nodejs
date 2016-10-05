const expect = require('chai').expect;
const lookups = require('../../utils/lookups');

const originalClassLookup = function classIdentity(classId) {
  switch (classId) {
    case 1:
      return "warrior"
    case 2:
      return "paladin"
    case 3:
      return "hunter"
    case 4:
      return "rogue"
    case 5:
      return "priest"
    case 6:
      return "death-knight"
    case 7:
      return "shaman"
    case 8:
      return "mage"
    case 9:
      return "warlock"
    case 10:
      return "monk"
    case 11:
      return "druid"
    case 12:
      return "demon-hunter"
    default:
      return null
  }
};

const originalBossLookup = function wclBossId(bossId) {
  // Emerald Nightmare Boss Id's
  switch(bossId) {
    case "Nythendra":
      return 1853
    case "Il'gynoth, Heart of Corruption":
      return 1873
    case "Elerethe Renferal":
      return 1876
    case "Ursoc":
      return 1841
    case "Dragons of Nightmare":
      return 1854
    case "Cenarius":
      return 1877
    case "Xavius":
      return 1864
  }
};


describe('lookups', () => {
  describe('class lookups', () => {
    describe('name lookup', () => {
      it('should do the same thing as the original lookup did', () => {
        for(var i = 1; i <= 12; i++){
          const originalLookup = originalClassLookup(i);
          const newLookup = lookups.lookupClassName(i);
          expect(originalLookup).to.equal(newLookup);
        }
      });

      it('should lookup a class name by its id', () => {
        expect(lookups.lookupClassName(1)).to.equal('warrior');
      });
    });

    describe('id lookup', () => {
      it('should lookup the class id by name', () => {
        expect(lookups.lookupClassId('warrior')).to.equal(1);
      });
    });
  });

  describe('boss lookups', () => {
    describe('id lookup', () => {
      it('should do the same thing as the original lookup did', () => {
        const bossNames = [
          "Nythendra",
          "Il'gynoth, Heart of Corruption",
          "Elerethe Renferal",
          "Ursoc",
          "Dragons of Nightmare",
          "Cenarius",
          "Xavius"
        ];
        bossNames.forEach(bossName => {
          const originalLookup = originalBossLookup(bossName);
          const newLookup = lookups.lookupBossId(bossName);
          expect(originalLookup).to.equal(newLookup);
        })
      });

      it('should lookup the boss id based on the name', () => {
        expect(lookups.lookupBossId('Nythendra')).to.equal(1853);
      });
    });

    describe('name lookup', () => {
      it('should lookup the boss name based on the id', () => {
        expect(lookups.lookupBossName(1853)).to.equal('Nythendra');
      });
    });
  });
});
