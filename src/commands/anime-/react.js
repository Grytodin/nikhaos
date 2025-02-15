const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

const reactions = ["hug", "kiss", "cuddle", "feed", "pat", "poke", "slap", "smug", "tickle", "wink"];

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
    const targetTag = target ? `@${target.username}` : "всех, кого обнимает эта любовь";

    return new EmbedBuilder()
      // В шапке эмбеда отображаем ник и круглую аватарку
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setColor("Random")
      .setTitle(`Реакция: ${getReactionTitle(category)}`)
      .setDescription(`**${userTag}** ${getReactionText(category)} **${targetTag}**! 💖`)
      .setImage(data.url)
      // Футер с информацией о том, кто запросил реакцию, с аватаркой и отметкой времени
      .setFooter({
        text: `Запросил: ${user.tag}`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();
  } catch (error) {
    console.error(`Ошибка получения реакции: ${error.message}`);
    return new EmbedBuilder()
      .setColor("Red")
      .setDescription("⚠ Не удалось получить реакцию. Попробуйте ещё раз!")
      .setFooter({
        text: `Запросил: ${user.tag}`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();
  }
}

function getReactionTitle(category) {
  const titles = {
    hug: "Обнимашки, чтобы согреться",
    kiss: "Поцелуй на ушко",
    cuddle: "Пригорнуться, как уютно",
    feed: "Готовлю для тебя сладости",
    pat: "Погладить по голове, как мило",
    poke: "Тык, ты меня слышишь?",
    slap: "Ляпас, но с любовью",
    smug: "Самовдоволенный взгляд",
    tickle: "Ласковое лоскотание",
    wink: "Подмигиваю тебе 😉"
  };
  return titles[category] || category;
}

function getReactionText(category) {
  const reactionTexts = {
    hug: "обнял так нежно",
    kiss: "поцеловал в щёчку",
    cuddle: "пригорнул к себе",
    feed: "покормил вкусняшками",
    pat: "погладил по головке",
    poke: "тыкнул тебя весело",
    slap: "пошлёпал нежно",
    smug: "смотрит на тебя с самодовольной улыбкой",
    tickle: "щекотал до слёз",
    wink: "подмигнул игриво"
  };
  return reactionTexts[category] || category;
}
