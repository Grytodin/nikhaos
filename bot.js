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
  // check for updates
  await checkForUpdates();

  // start the dashboard
  if (client.config.DASHBOARD.enabled) {
    client.logger.log("Launching dashboard");
    try {
      const { launch } = require("@root/dashboard/app");

      // let the dashboard initialize the database
      await launch(client);
    } catch (ex) {
      client.logger.error("Failed to launch dashboard", ex);
    }
  } else {
    // initialize the database
    await initializeMongoose();
  }

  // start the client
  await client.login(process.env.BOT_TOKEN);

  // Функція для оновлення статусу
  const updateStatus = async () => {
    const channelId = "1316135511160782887"; // Замініть на ID каналу
    const channel = await client.channels.fetch(channelId);
    if (!channel) return console.error("Не вдалося знайти канал для статусу.");

    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const uptime = `<t:${Math.floor(client.readyTimestamp / 1000)}:R>`;

    const embed = {
      color: 0x00ff00, // Зелений колір
      title: "📢 Статус бота",
      description: `✅ **Онлайн:** ${uptime}\n🌍 **Сервери:** ${totalGuilds}\n👥 **Учасники:** ${totalUsers}`,
      timestamp: new Date(),
      footer: { text: "Автооновлення кожні 5 хвилин" },
    };

    // Отримуємо останнє повідомлення бота в каналі
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessage = messages.find(msg => msg.author.id === client.user.id);

    if (botMessage) {
      await botMessage.edit({ embeds: [embed] }).catch(console.error);
    } else {
      await channel.send({ embeds: [embed] }).catch(console.error);
    }
  };

  client.once("ready", async () => {
    await updateStatus(); // Оновити одразу при запуску
    setInterval(updateStatus, 5 * 60 * 1000); // Оновлювати кожні 5 хвилин
  });
})();