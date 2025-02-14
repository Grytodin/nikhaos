const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Donations = require("../../database/schemas/Donations");

module.exports = {
  name: "donate",
  description: "Показує список донатерів та їх внески",
  cooldown: 5,
  category: "UTILITY",
  botPermissions: [],
  userPermissions: [],
  command: {
    enabled: true,
    aliases: ["донатеры", "дон", "adddonate"], // Додано adddonate як аліас
    usage: "[сума]$ [@користувач]",
    minArgsCount: 0,
    subcommands: [],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "add",
        description: "Додати донат користувачу",
        type: 1,
        options: [
          {
            name: "user",
            description: "Користувач",
            type: 6, // USER
            required: true,
          },
          {
            name: "amount",
            description: "Сума донату (USD)",
            type: 10, // NUMBER
            required: true,
          },
        ],
      },
    ],
  },

  /**
   * Обробка текстової команди (donate та adddonate)
   */
  messageRun: async (message, args) => {
    try {
      // Якщо команда викликана як !adddonate
      if (message.content.startsWith("!adddonate")) {
        const amountArg = args[0].replace(/\$/g, ''); // Видаляємо всі $
        const amount = parseFloat(amountArg);

        // Перевірка коректності суми
        if (isNaN(amount) || amount <= 0) {
          return message.reply("❌ Будь ласка, вкажіть коректну суму (наприклад: `5.50$`).");
        }

        // Визначаємо користувача (якщо згаданий хтось, інакше - автор)
        const targetUser = message.mentions.users.first() || message.author;
        if (targetUser.bot) {
          return message.reply("❌ Не можна додавати донат боту.");
        }

        // Перевірка прав адміністратора
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return message.reply("❌ У вас немає прав на цю команду.");
        }

        // Оновлюємо базу даних
        const donation = await Donations.findOneAndUpdate(
          { guildId: message.guild.id, userId: targetUser.id },
          { $inc: { amount: amount } },
          { upsert: true, new: true }
        );

        // Підтвердження
        return message.reply(
          `✅ Додано **$${amount.toFixed(2)}** до донату <@${targetUser.id}>. Загальна сума: **$${donation.amount.toFixed(2)}**`
        );
      }

      // Якщо команда викликана як !donate
      const roleName = "・Bot sponsor";
      const role = message.guild.roles.cache.find(r => r.name === roleName);

      if (!role) {
        return message.reply(`❌ Роль **${roleName}** не знайдена.`);
      }

      const membersWithRole = role.members;
      if (membersWithRole.size === 0) {
        return message.reply(`Ніхто ще не має ролі **${roleName}**.`);
      }

      // Отримуємо дані з бази
      const donations = await Donations.find({ guildId: message.guild.id });

      // Формуємо список
      const donorList = membersWithRole
        .map((member) => {
          const userDonation = donations.find(d => d.userId === member.id);
          return {
            id: member.id,
            amount: userDonation ? userDonation.amount : 0,
          };
        })
        .sort((a, b) => b.amount - a.amount)
        .map((donor, index) => `**${index + 1}.** <@${donor.id}> — **$${donor.amount.toFixed(2)}**`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle(`💖 Список донатерів`)
        .setDescription(donorList)
        .setColor("Gold")
        .setFooter({ text: "Дякуємо за вашу підтримку! 🥰" });

      await message.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Помилка у команді donate/adddonate:", err);
      message.reply("❌ Сталася помилка під час виконання команди.");
    }
  },

  /**
   * Обробка слеш-команди (donate add)
   */
  interactionRun: async (interaction) => {
    try {
      if (interaction.options.getSubcommand() === "add") {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: "❌ У вас немає прав на цю команду.", ephemeral: true });
        }

        const user = interaction.options.getUser("user");
        const amount = interaction.options.getNumber("amount");

        if (amount <= 0) {
          return interaction.reply({ content: "❌ Сума має бути більше 0.", ephemeral: true });
        }

        await interaction.deferReply(); // Запобігає помилці "The reply has already been sent"

        // Оновлюємо запис у базі
        const donation = await Donations.findOneAndUpdate(
          { guildId: interaction.guild.id, userId: user.id },
          { $inc: { amount: amount } },
          { upsert: true, new: true }
        );

        if (!donation || !donation.amount) {
          donation.amount = amount; // Виправлення можливого undefined
        }

        await interaction.editReply({
          content: `✅ Додано **$${amount.toFixed(2)}** до донату <@${user.id}>. Загальна сума: **$${donation.amount.toFixed(2)}**`,
        });
      }
    } catch (err) {
      console.error("Помилка у команді donate add:", err);
      if (interaction.replied || interaction.deferred) {
        interaction.editReply("❌ Сталася помилка під час виконання команди.");
      } else {
        interaction.reply({ content: "❌ Сталася помилка під час виконання команди.", ephemeral: true });
      }
    }
  },
};