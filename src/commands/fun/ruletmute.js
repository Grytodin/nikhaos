const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "ruletmute",
  description: "Гра в російську рулетку на м'ют",
  category: "FUN",
  botPermissions: ["ManageRoles"],
  cooldown: 10,
  command: {
    enabled: true,
    usage: "<10m|30m|1h>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "time",
        description: "Тривалість мута (10m, 30m, 1h)",
        type: 3, // STRING
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    if (!args.length) {
      return message.reply("Будь ласка, вкажіть тривалість мута: 10m, 30m або 1h.");
    }
    const time = args[0];
    await handleRuletMute(message, time);
  },

  async interactionRun(interaction) {
    const time = interaction.options.getString("time");
    await handleRuletMute(interaction, time);
  },
};

async function handleRuletMute(context, time) {
  const validTimes = { "10m": 600000, "30m": 1800000, "1h": 3600000 };

  if (!validTimes[time]) {
    return context.reply("Неправильний формат часу. Використовуйте 10m, 30m або 1h.");
  }

  let remainingTime = 600; // 10 хвилин (600 секунд)
  const embed = new EmbedBuilder()
    .setTitle("🎰 Рулетка на м'ют")
    .setDescription(`Поставте реакцію 👍, щоб взяти участь!\n\n⏳ Залишилось: **${remainingTime / 60} хв**`)
    .setColor("Yellow");

  const msg = await context.reply({ embeds: [embed], fetchReply: true });
  await msg.react("👍");

  // Оновлення таймера кожні 30 секунд
  const timerInterval = setInterval(async () => {
    remainingTime -= 30;
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      return;
    }
    embed.setDescription(`Поставте реакцію 👍, щоб взяти участь!\n\n⏳ Залишилось: **${Math.ceil(remainingTime / 60)} хв**`);
    await msg.edit({ embeds: [embed] });
  }, 30000);

  // Через 10 хвилин вибираємо випадкового учасника
  setTimeout(async () => {
    clearInterval(timerInterval);
    const reaction = msg.reactions.cache.get("👍");
    if (!reaction) return context.channel.send("Ніхто не взяв участь у грі.");

    const usersReacted = await reaction.users.fetch();
    const participants = usersReacted.filter((user) => !user.bot).map((user) => user.id);

    if (participants.length === 0) return context.channel.send("Ніхто не взяв участь у грі.");

    const winnerId = participants[Math.floor(Math.random() * participants.length)];
    const member = context.guild.members.cache.get(winnerId);

    if (!member) return context.channel.send("Не вдалося знайти учасника.");

    try {
      await member.timeout(validTimes[time], `Рулетка мута на ${time}`);
      embed
        .setTitle("🎰 Рулетка завершена!")
        .setDescription(`🔇 ${member.user.username} отримав м'ют на ${time}!`)
        .setColor("Red");
      await msg.edit({ embeds: [embed] });
    } catch (error) {
      console.error("Помилка мута:", error);
      await context.channel.send("Не вдалося видати м'ют. Переконайтеся, що у бота є відповідні права.");
    }
  }, 600000); // Час очікування 10 хвилин
}
