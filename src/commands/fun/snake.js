const { SnakeGame } = require("@majoexe/games");

module.exports = {
  name: "snake",
  description: "Play a snake game using buttons",
  cooldown: 10,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "ReadMessageHistory"],

  async messageRun(message) {
    const game = new SnakeGame({
      message: message,
      embedTitle: "🐍 Snake Game",
      embedColor: "Green",
      buttonStyle: "PRIMARY",
    });

    await game.startGame();
  },

  async interactionRun(interaction) {
    const game = new SnakeGame({
      message: interaction,
      embedTitle: "🐍 Snake Game",
      embedColor: "Green",
      buttonStyle: "PRIMARY",
    });

    await game.startGame();
  },
};