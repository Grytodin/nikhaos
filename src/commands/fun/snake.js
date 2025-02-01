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

  async messageRun(message, args) {
    await message.safeReply("**Starting Snake Game** (only you can see it)");
    await startSnakeGame(message, false);
  },

  async interactionRun(interaction) {
    await interaction.reply({ content: "**Starting Snake Game** (only you can see it)", ephemeral: true });
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
    // Start game visible only to the user who initiated it
    const gameResult = await snakeGame.newGame(isInteraction ? data : data.channel.send({
      content: "Your game is ready!",
      ephemeral: true,
    }));

    // Post the result publicly after game ends
    const resultMessage = `**Game Over!**\n**Player:** ${isInteraction ? data.user.tag : data.author.tag}\n**Score:** ${gameResult.score}`;

    const publicChannel = isInteraction ? data.channel : data.channel;
    await publicChannel.send(resultMessage);
  } catch (error) {
    console.error("Error starting snake game:", error);

    // Notify user about error
    if (isInteraction) {
      await data.followUp({ content: "An error occurred while starting the Snake Game. Please try again.", ephemeral: true });
    } else {
      await data.reply("An error occurred while starting the Snake Game. Please try again.");
    }
  }
}
