const SnakeGame = require("snakecord");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "snake",
  description: "play snake game on discord",
  cooldown: 10,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    await message.safeReply("**Starting Snake Game** (only you can see it)");
    await startSnakeGame(message, false);
  },

  async interactionRun(interaction) {
    await interaction.reply({ content: "", ephemeral: true });
    await startSnakeGame(interaction, true);
  },
};

async function startSnakeGame(data, isInteraction) {
  const snakeGame = new SnakeGame({
    title: "Snake Game",
    color: "BLUE",
    timestamp: true,
    gameOverTitle: "Game Over",
  });

  try {
    const gameResult = await snakeGame.newGame(data); // Запуск гри

    if (gameResult && gameResult.score !== undefined) {
      const resultMessage = `**Game Over!**\n**Player:** ${isInteraction ? data.user.tag : data.author.tag}\n**Score:** ${gameResult.score}`;
      await data.channel.send(resultMessage);
    } else {
      console.error("Game result is undefined or missing score:", gameResult);
      await data.channel.send("An error occurred while retrieving the game result.");
    }
  } catch (error) {
    console.error("Error starting snake game:", error);
    if (isInteraction) {
      await data.followUp({ content: "An error occurred while starting the Snake Game. Please try again.", ephemeral: true });
    } else {
      await data.reply("An error occurred while starting the Snake Game. Please try again.");
    }
  }
}
