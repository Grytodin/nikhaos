const { Snake } = require("discord-gamecord");

module.exports = {
  name: "snake",
  description: "Play a snake game using buttons",
  cooldown: 10,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "ReadMessageHistory"],

  command: { enabled: true },
  slashCommand: { enabled: true },

  async messageRun(message) {
    await startSnakeGame(message);
  },

  async interactionRun(interaction) {
    await startSnakeGame(interaction);
  },
};

async function startSnakeGame(interaction) {
  const game = new Snake({
    message: interaction,
    embed: {
      title: "🐍 Snake Game",
      color: "#00FF00",
      overTitle: "Game Over!",
    },
    emojis: {
      board: "⬛",
      food: "🍎",
      up: "⬆",
      down: "⬇",
      left: "⬅",
      right: "➡",
    },
    stopButton: "Stop",
    timeoutTime: 60000,
    playerOnlyMessage: "Ти не можеш грати за іншу людину!",
  });

  await game.startGame();
}