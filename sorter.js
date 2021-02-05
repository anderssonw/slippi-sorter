const { default: SlippiGame } = require("@slippi/slippi-js");
const fs = require("fs-extra");
const config = require("./config.json");
const files = fs.readdirSync(config.slippiDir);

createFolders();

const slippiFiles = files.filter((file) => {
  return file.includes(".slp");
});

const games = slippiFiles.map((fileName) => {
  return new SlippiGame(config.slippiDir + "\\" + fileName);
});

// Get metadata - start time, platform played on, etc
games.forEach((game) => {
  let slpPlayers = game.getMetadata().players;
  if (slpPlayers.length > 2) return;
  let otherSlpPlayer = Object.values(slpPlayers).filter((player) => {
    return player.names.code != config.yourCodeHere;
  })[0];

  let chosenPlayers = config.players;

  chosenPlayers = chosenPlayers.filter((player) => {
    return player.code == otherSlpPlayer.names.code;
  });

  if (chosenPlayers.length == 1) {
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

function createFolders() {
  config.players.forEach((player) => {
    try {
      fs.mkdirSync(config.slippiDir + "\\" + player.folderName);
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }
  });
}
