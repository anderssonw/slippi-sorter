const { default: SlippiGame } = require("@slippi/slippi-js");
const fs = require("fs-extra");
const config = require("./config.json");

let count = 0;

checkConfig();

const files = fs.readdirSync(config.slippiDir);

createFolders();

const slippiFiles = files.filter((file) => {
  return file.includes(".slp");
});

if (slippiFiles.length != 0) {
  const games = slippiFiles
    .map((fileName) => {
      let slippiGame = new SlippiGame(config.slippiDir + "\\" + fileName);

      if (slippiGame.getMetadata()) {
        return slippiGame;
      }

      return null;
    })
    .filter((game) => game != null);

  games.forEach((game) => {
    let metaData = game.getMetadata();
    let slpPlayers = Object.values(metaData.players);

    //Don't handle doubles
    if (slpPlayers.length > 2) return;

    let otherSlpPlayer = slpPlayers.filter((player) => {
      return player.names.code != config.yourCodeHere;
    })[0];

    let chosenPlayers = config.players.filter((player) => {
      return player.code == otherSlpPlayer.names.code;
    });

    if (chosenPlayers.length == 1) {
      count++;
      let slpFileName = game.getFilePath().split("\\").pop();
      fs.move(
        game.getFilePath(),
        config.slippiDir +
          "\\" +
          chosenPlayers[0].folderName +
          "\\" +
          slpFileName,
        (err) => {
          if (err) throw err;
        }
      );
    }
  });
  console.log("Sorted " + count + " slippi files");
} else {
  console.log("No slippi files to sort in given folder");
}

function createFolders() {
  config.players.forEach((player) => {
    try {
      fs.mkdirSync(config.slippiDir + "\\" + player.folderName);
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }
  });
}

function checkConfig() {
  if (config) {
    if (!config.yourCodeHere) throw new Error("Config: yourCodeHere undefined");
    if (!config.slippiDir) throw new Error("Config: slippiDir undefined");
    if (config.players) {
      config.players.forEach((player) => {
        if (!player.folderName)
          throw new Error(
            "Config: folderName undefined, did you add folderName to all players?"
          );
        if (!player.code)
          throw new Error(
            "Config: code undefined, did you add code to all players?"
          );
      });
    } else
      throw new Error(
        "Config: Players undefined: Did you add players in config.json?"
      );
  } else {
    throw new Error("Config: Config undefined, did you add data to config?");
  }
}
