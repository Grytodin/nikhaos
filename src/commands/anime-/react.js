const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

const reactions = ["hug", "kiss", "cuddle", "feed", "pat", "poke", "slap", "smug", "tickle", "wink"];

module.exports = {
  name: "react",
  description: "Отправить аниме-реакцию, которая растопит чьё-то сердце!",
  category: "ANIME",
  cooldown: 5,
  aliases: reactions, // Додаємо псевдоніми для команд

  async execute(message, args) {
    const command = message.commandName || args[0];
    if (!reactions.includes(command)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `❌ Такої реакції не існує: \`${command}\`\n` +
              `✅ Доступні реакції: ${reactions.map(r => `\`${r}\``).join(", ")}`
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
    if (!data.url) throw new Error("Не вдалося отримати зображення");

    const userTag = `@${user.username}`;
    const targetTag = target ? `@${target.username}` : "всіх, кого обіймає ця любов";

    return new EmbedBuilder()
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setColor("Random")
      .setTitle(`Реакція: ${getReactionTitle(category)}`)
      .setDescription(`**${userTag}** ${getReactionText(category)} **${targetTag}**! 💖`)
      .setImage(data.url)
      .setFooter({
        text: `Запросив: ${user.tag}`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();
  } catch (error) {
    console.error(`Помилка отримання реакції: ${error.message}`);
    return new EmbedBuilder()
      .setColor("Red")
      .setDescription("⚠ Не вдалося отримати реакцію. Спробуйте ще раз!")
      .setFooter({
        text: `Запросив: ${user.tag}`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();
  }
}

function getReactionTitle(category) {
  const titles = {
    hug: "Обійми, щоб зігріти",
    kiss: "Поцілунок у щічку",
    cuddle: "Пригорнувся, як затишно",
    feed: "Пригощаю смаколиками",
    pat: "Погладив по голівці",
    poke: "Торкнув тебе грайливо",
    slap: "Ляпас, але з любов'ю",
    smug: "Самовдоволений погляд",
    tickle: "Лоскітне відчуття",
    wink: "Підморгнув тобі 😉"
  };
  return titles[category] || category;
}

function getReactionText(category) {
  const reactionTexts = {
    hug: "обійняв ніжно",
    kiss: "поцілував у щічку",
    cuddle: "пригорнув до себе",
    feed: "пригостив смаколиками",
    pat: "погладив по голівці",
    poke: "торкнув тебе",
    slap: "плеснув тебе",
    smug: "подивився самовдоволено",
    tickle: "полоскав ніжно",
    wink: "підморгнув грайливо"
  };
  return reactionTexts[category] || category;
}
