const https = require('https');
const express = require('express');
const access = require('./access');
const app = express();

// setting ejs as templating engine
app.set('view engine', 'ejs');
// allowing access to public folder from the server
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/thing', (req, res) => {
   res.send('this is thing');
});

app.get('/:region/:server/:characterName', (req, res) => {
	getCharacterInfo(req, res, displayParsedData);
});

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

function getCharacterInfo(characterReq, characterRes, callback) {
  var cleanCharacterName = htmlEncode(characterReq.params.characterName);

  https.get('https://' + characterReq.params.region + '.api.battle.net/wow/character/' + characterReq.params.server +  '/' + cleanCharacterName + '?fields=progression,items&locale=en_US&apikey=' + access.keys.blizz, (res) => {

      res.setEncoding('utf8');

      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
      console.log('Request made for ' + cleanCharacterName + ' on the server ' + characterReq.params.server);

      // variable for incoming data
      var body = '';

      // parses through data as it's recieved. buffer or not.
      res.on('data', (d) => {
          //process.stdout.write(d);
          body += d;
      });

      // parses the recieved data and sends it to the callback function. also catches any errors.
      res.on('end', () => {
         try {
             var parsed = JSON.parse(body);
         } catch (err) {
             console.error('Unable to parse: ', err);
             return callback(err);
         }
         console.log("statusCodev2: " + res.statusCode);
         callback(null, parsed, characterReq, characterRes, res.statusCode);
      });

  }).on('error', (e) => {
      callback(e);
  });
}

// check character names for special characters
function htmlEncode(characterName) {
  var n = characterName.length;
  var encoded = [];

  while (n--) {
    var charCode = characterName[n].charCodeAt();
    if (charCode < 65 || charCode > 127 || (charCode > 90 && charCode < 96)) {
      encoded[n] = encodeURI(characterName[n]);
    } else {
      encoded[n] = characterName[n];
    }
  }

  return encoded.join('');
}

// determining character's class based on class id sent from the API
function classIdentity(classId) {
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
}

// overall sorting and filtering of data
function sortParsedData(err, data) {
  if (err) {
    return err;
  } else {

    // sorting out character info and progress info
    var sortData = {
      name: data.name,
      class: classIdentity(data.class),
      realm: data.realm,
      itemLevel: data.items.averageItemLevel,
      progress: data.progression.raids
        .filter((item, index) => {
          // HFC is only for testing until the raid opens up AND the armory starts updating again
          // item.name == "The Emerald Nightmare" || item.name == "The Nighthold"
          if(item.name == "The Emerald Nightmare") {
            return item;
          }
        })
        .map((item, index) => {
          return {
            name: item.name,
            bosses: item.bosses,
            totalBosses: bossTotal(item.bosses),
            lfrProgress: difficultyProgress("lfr", item),
            normalProgress: difficultyProgress("normal", item),
            heroicProgress: difficultyProgress("heroic", item),
            mythicProgress: difficultyProgress("mythic", item)
          };
        })
    }
    return sortData;
  }
}

// Obtains total bosses in an instance
function bossTotal(bossData) {
  var bossCount = 0;

  for(var b = 0; b < bossData.length; b++) {
    bossCount++;
  }

  return bossCount;
}

// Obtains bosses killed for a given raid difficulty
function difficultyProgress (difficulty, bossData) {
  var killSearch = difficulty + "Kills";
  var progress = 0;

  for (var b = 0; b < bossData.bosses.length; b++) {
    if(bossData.bosses[b][killSearch] > 0) {
      progress++;
    }
  }

  return progress;
}

function displayParsedData(err, data, originReq, originRes, statusCode) {
    if (err) throw err;
    if (statusCode !== 404){
      var sortedData = sortParsedData(err, data);
      console.log('sortedData keys: ' + Object.keys(sortedData.progress[0]));
      console.log('sortedData: ' + sortedData.progress[0].name);

      originRes.render('character-info', {info: sortedData});
    } else {
      var characterData = {
        "name": originReq.params.characterName,
        "server": originReq.params.server
      };
      originRes.render('character-404', {info: characterData});
    }
}

app.listen(8080, () => {
    console.log('app is listening to port 8080');
});
