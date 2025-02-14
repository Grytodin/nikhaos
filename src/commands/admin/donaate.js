const { EmbedBuilder } = require("discord.js");

/**
 * Placeholder for command data
 * @type {CommandData}
 */
module.exports = {
  name: "donate", // Название команды
  description: "Показывает список донатеров", // Описание команды
  cooldown: 5, // Время перезарядки команды в секундах
  category: "UTILITY", // Категория команды
  botPermissions: [], // Права, нужные боту
  userPermissions: [], // Права, нужные пользователю
  command: {
    enabled: true, // Включение текстовой команды
    aliases: ["донатеры", "дон"], // Синонимы для команды
    usage: "", // Формат использования команды
    minArgsCount: 0, // Минимальное количество аргументов
    subcommands: [], // Подкоманды (если есть)
  },
  slashCommand: {
    enabled: false, // Отключение слэш-команды
    ephemeral: false,
    options: [],
  },

  /**
   * Выполнение текстовой команды
   */
  messageRun: async (message, args, data) => {
    const roleName = "・Bot sponsor"; // Название роли донатеров
    const role = message.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
      return message.reply(`Роль **${roleName}** не найдена на этом сервере.`);
    }

    const membersWithRole = role.members;

    if (membersWithRole.size === 0) {
      return message.reply(`Никто ещё не получил роль **${roleName}**.`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`Список донатеров 💖`)
      .setDescription(
        membersWithRole
          .map((member, index) => `✨ <@${member.id}>`)
          .join("\n")
      )
      .setColor("Gold")
      .setFooter({ text: "Спасибо за вашу поддержку! 🥰" });

    await message.reply({ embeds: [embed] });
  },

  /**
   * Выполнение слэш-команды
   */
  interactionRun: (interaction, data) => {
    interaction.reply("Эта команда не поддерживает слэш-взаимодействия.");
  },
};
