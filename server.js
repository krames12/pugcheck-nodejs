const https = require('https');
const express = require('express');
const app = express();
const lookups = require('./utils/lookups');
const lookupClassName = lookups.lookupClassName;
const lookupBossId = lookups.lookupBossId;

var port = process.env.PORT || 8080

// setting ejs as templating engine
app.set('view engine', 'ejs');
// allowing access to public folder from the server
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/:region/:server/:characterName', (req, res) => {
  const region = req.params.region;
  var server = req.params.server;
  const serverDash = server.replace(/\s/g, '-');
  const blizzKey = process.env.BLIZZ_KEY
  const wclKey = process.env.WCL_KEY;
  const cleanCharacterName = htmlEncode(req.params.characterName);
  const blizzRequestUrl = `https://${region}.api.battle.net/wow/character/${serverDash}/${cleanCharacterName}?fields=progression,items&locale=en_US&apikey=${blizzKey}`;
  const wclRequestUrl = `https://www.warcraftlogs.com:443/v1/rankings/character/${cleanCharacterName}/${serverDash}/${region}?api_key=${wclKey}`;

  console.log('server', serverDash);

	Promise.all([getRequest(blizzRequestUrl, req, res), getRequest(wclRequestUrl, req, res)]).then(sortParsedData).then(function(sortData) {
    res.render('character-info', {info: sortData});
  }).catch((err) => {
    console.log(err);
    res.render('character-404');
  });
});

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

function getRequest(requestUrl, originReq, originRes) {
  return new Promise((resolve, reject) => {
    https.get(requestUrl, (res) => {
      res.setEncoding('utf8');

      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
      //console.log('Request made for ' + originReq.params.characterName + ' on the server ' + originReq.params.server);

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
          return reject(err);
        }
        console.log("statusCodev2: " + res.statusCode);
        if (res.statusCode !== 404 || 504){
          resolve(parsed);
        } else {
          reject()
        }
      });

    }).on('error', (err) => {
      reject(err);
    });
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

// overall sorting and filtering of data
function sortParsedData(data) {
  // sorting out character info and progress info
  var sortData = {
    name: data[0].name,
    class: lookupClassName(data[0].class),
    realm: data[0].realm,
    itemLevel: data[0].items.averageItemLevel,
    progress: data[0].progression.raids
      .filter((item, index) => {
        if(item.name == "The Emerald Nightmare" || item.name == "Trial of Valor") {
          return item;
        }
      })
      .map((item, index) => {
        return {
          name: item.name,
          bosses: item.bosses.map((item, index) => {
            return {
              name: item.name,
              bossId: lookupBossId(item.name),
              lfrKills: item.lfrKills,
              normalKills: item.normalKills,
              heroicKills: item.heroicKills,
              mythicKills: item.mythicKills,
              warcraftLogs: false
            }
          }),
          totalBosses: item.bosses.length,
          lfrProgress: difficultyProgress("lfr", item),
          normalProgress: difficultyProgress("normal", item),
          heroicProgress: difficultyProgress("heroic", item),
          mythicProgress: difficultyProgress("mythic", item)
        };
      })
  };

  // janky loop to add warcraftLogs info to pertaining bosses
  for(var i = 0; i < sortData.progress[0].bosses.length; i++) {
    var currentBoss = sortData.progress[0].bosses[i];
    var logData = data[1];
    var difficulty = 2;
    currentBoss.highestDifficulty = "Looking For Raid";

    if(currentBoss.mythicKills > 0) {
      difficulty = 5;
      currentBoss.highestDifficulty = "Mythic";
    } else if(currentBoss.heroicKills > 0) {
      difficulty = 4;
      currentBoss.highestDifficulty = "Heroic";
    } else if(currentBoss.normalKills > 0) {
      difficulty = 3;
      currentBoss.highestDifficulty = "Normal";
    }

    for(var p = 0; p < logData.length; p++) {
      if (currentBoss.bossId === logData[p].encounter && difficulty === logData[p].difficulty) {
        var reportUrl = "https://www.warcraftlogs.com/reports/" + logData[p].reportID + "#fight=" + logData[p].fightID;
        currentBoss.warcraftLogs = true;
        currentBoss.reportUrl = reportUrl;
      }
    }
  }

  console.log('Request made for', sortData.name, "on the realm", sortData.realm);
  return sortData;
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

app.listen(port, () => {
    console.log('app is listening to port', port);
});
