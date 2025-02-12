require("dotenv").config();
require("module-alias/register");

// register extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");

validateConfiguration();

// initialize client
const client = new BotClient();
client.loadCommands("src/commands");
client.loadContexts("src/contexts");
client.loadEvents("src/events");

// find unhandled promise rejections
process.on("unhandledRejection", (err) => client.logger.error(`Unhandled exception`, err));

(async () => {
  // Проверка обновлений
  await checkForUpdates();

  // Запуск панели управления
  if (client.config.DASHBOARD.enabled) {
    client.logger.log("Запуск панели управления...");
    try {
      const { launch } = require("@root/dashboard/app");
      await launch(client);
    } catch (ex) {
      client.logger.error("Ошибка запуска панели управления", ex);
    }
  } else {
    await initializeMongoose();
  }

  await client.login(process.env.BOT_TOKEN);

  // Функция для обновления статуса
  const updateStatus = async () => {
    const channelId = "1316135511160782887"; // Вставьте ID вашего канала
    const channel = await client.channels.fetch(channelId);
    if (!channel) return console.error("❌ Не удалось найти канал для статуса.");

    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const uptime = `<t:${Math.floor(client.readyTimestamp / 1000)}:R>`;
    const ping = `${client.ws.ping}ms`;

    const embed = {
      color: 0x2f3136, // Темный цвет
      title: "📢 Статус бота",
      description: "Актуальная информация о работе бота",
      fields: [
        { name: "🟢 **Статус**", value: `Онлайн ${uptime}`, inline: true },
        { name: "📶 **Пинг**", value: `\`${ping}\``, inline: true },
        { name: "🌍 **Серверов**", value: `\`${totalGuilds}\``, inline: true },
        { name: "👥 **Пользователей**", value: `\`${totalUsers}\``, inline: true }
      ],
      timestamp: new Date(),
      footer: { text: "⏳ Обновление каждые 10 секунд" },
    };

    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessage = messages.find(msg => msg.author.id === client.user.id);

    if (botMessage) {
      await botMessage.edit({ embeds: [embed] }).catch(console.error);
    } else {
      await channel.send({ embeds: [embed] }).catch(console.error);
    }
  };

  client.once("ready", async () => {
    await updateStatus(); // Обновить сразу при запуске
    setInterval(updateStatus, 10 * 1000); // Обновлять каждые 10 секунд
  });
})();