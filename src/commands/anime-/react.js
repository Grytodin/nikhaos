const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

const reactions = ["hug", "kiss", "cuddle", "feed", "pat", "poke", "slap", "smug", "tickle", "wink", "blush", "cheer", "wave"];

module.exports = {
  name: "react",
  description: "Отправить аниме-реакцию, которая растопит чьё-то сердце!",
  category: "ANIME",
  cooldown: 5,
  aliases: reactions, // Команда будет работать как !hug, !kiss и т.д.

  async messageRun(message) {
    const command = message.content.slice(1).split(" ")[0].toLowerCase();
    if (!reactions.includes(command)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `❌ Ой-ой, такой реакции не существует: \`${command}\`\n` +
              `✅ Вот какие милые реакции ты можешь отправить: ${reactions.map(r => `\`${r}\``).join(", ")}`
            )
        ]
      });
    }

    const target = message.mentions.users.first();
    const embed = await createReactionEmbed(command, message.author, target);
    await message.reply({ embeds: [embed] });
  }
};

async function createReactionEmbed(category, user, target) {
  try {
    const { data } = await axios.get(`https://api.waifu.pics/sfw/${category}`);
    if (!data.url) throw new Error("Не удалось получить изображение");

    const userTag = `@${user.username}`;
    const targetTag = target ? `@${target.username}` : "всему чату с любовью 💕";

    return new EmbedBuilder()
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setColor("Random")
      .setTitle(`Реакция: ${getReactionTitle(category)}`)
      .setDescription(`**${userTag}** ${getReactionText(category)} **${targetTag}**! 💖✨`)
      .setImage(data.url)
      .setFooter({
        text: `Запросил: ${user.tag}`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();
  } catch (error) {
    console.error(`Ошибка получения реакции: ${error.message}`);
    return new EmbedBuilder()
      .setColor("Red")
      .setDescription("⚠ Не удалось получить реакцию. Попробуйте ещё раз! 😢")
      .setFooter({
        text: `Запросил: ${user.tag}`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();
  }
}

function getReactionTitle(category) {
  const titles = {
    hug: "🤗 Тёплые обнимашки!",
    kiss: "💋 Нежный поцелуй!",
    cuddle: "🐻 Уютные обнимашки!",
    feed: "🍰 Вкусняшка для тебя!",
    pat: "🖐 Ласковый погладон!",
    poke: "👉 Тык-тык!",
    slap: "✋ Шлёп-шлёп!",
    smug: "😏 Лукавая улыбка!",
    tickle: "😆 Лоскотание до слёз!",
    wink: "😉 Подмигиваю с теплом!",
    blush: "😊 Краснею от смущения!",
    cheer: "🎉 Улыбнись, всё будет хорошо!",
    wave: "👋 Весёлое приветствие!"
  };
  return titles[category] || category;
}

function getReactionText(category) {
  const reactionTexts = {
    hug: "обнял тебя так нежно и крепко 🤗💕",
    kiss: "поцеловал тебя в щёчку 💋🥰",
    cuddle: "пригорнул к себе, чтобы согреть 💖🐻",
    feed: "покормил тебя вкусняшками 🍰🍫",
    pat: "погладил тебя по голове с заботой 🖐💞",
    poke: "весело тыкнул тебя 👉😆",
    slap: "игриво шлёпнул тебя ✋😜",
    smug: "посмотрел на тебя с хитрой улыбкой 😏✨",
    tickle: "щекотал тебя до смеха и слёз 🤣🎈",
    wink: "подмигнул тебе с нежностью 😉💘",
    blush: "смущённо покраснел, глядя на тебя 😊💓",
    cheer: "подбодрил тебя, ты супер! 🎉💖",
    wave: "весело помахал тебе лапкой 👋😊"
  };
  return reactionTexts[category] || category;
}
