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
  var cleanCharacterName = htmlEncode(req.params.characterName),
    blizzRequestUrl = 'https://' + req.params.region + '.api.battle.net/wow/character/' + req.params.server +  '/' + cleanCharacterName + '?fields=progression,items&locale=en_US&apikey=' + access.keys.blizz,
    wclRequestUrl = 'https://www.warcraftlogs.com:443/v1/rankings/character/' + cleanCharacterName + '/' + req.params.server + '/' + req.params.region + '?api_key=' + access.keys.wcl;
    
	getRequest(blizzRequestUrl, req, res, parseCharacterData);
});

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

function getRequest(requestUrl, originReq, originRes, callback) {
  https.get(requestUrl, (res) => {

      res.setEncoding('utf8');

      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
      console.log('Request made for ' + originReq.params.characterName + ' on the server ' + originReq.params.server);

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
         callback(null, parsed, originReq, originRes, res.statusCode);
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
function sortParsedData(err, data, req, res) {
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

function parseCharacterData(err, data, originReq, originRes, statusCode) {
    if (err) throw err;
    if (statusCode !== 404){
      var sortedData = sortParsedData(err, data);

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
