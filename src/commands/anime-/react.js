const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const axios = require("axios");

const choices = ["hug", "kiss", "cuddle", "feed", "pat", "poke", "slap", "smug", "tickle", "wink", "gachi"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "react",
  description: "anime reactions",
  enabled: true,
  category: "ANIME",
  cooldown: 5,
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "[reaction]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "category",
        description: "reaction type",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: choices.map((ch) => ({ name: ch, value: ch })),
      },
    ],
  },

  async messageRun(message, args) {
    const category = args[0].toLowerCase();
    if (!choices.includes(category)) {
      return message.safeReply(`Invalid choice: \`${category}\`.\nAvailable reactions: ${choices.join(", ")}`);
    }

    const embed = await genReaction(category, message.author);
    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("category");
    const embed = await genReaction(choice, interaction.user);
    await interaction.followUp({ embeds: [embed] });
  },
};

const genReaction = async (category, user) => {
  try {
    const tenorApiKey = "AIzaSyAcAMBkm9DvIcxxwwfQ3TMDHnX-URmjTME"; // Замініть на ваш API-ключ Tenor
    const query = category || "happy"; 

    const response = await axios.get(`https://tenor.googleapis.com/v2/search`, {
      params: {
        key: tenorApiKey,
        q: query,
        limit: 10, // Отримуємо 10 результатів для унікальності
        media_filter: "minimal",
      },
    });

    if (!response.data.results.length) throw new Error("No results found");

    // Вибираємо випадковий GIF, щоб уникнути повторень
    const randomIndex = Math.floor(Math.random() * response.data.results.length);
    const imageUrl = response.data.results[randomIndex].media_formats.gif.url;

    return new EmbedBuilder()
      .setImage(imageUrl)
      .setColor("Random")
      .setFooter({ text: `Requested By ${user.tag}` });
  } catch (ex) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("Failed to fetch reaction. Try again!")
      .setFooter({ text: `Requested By ${user.tag}` });
  }
};
