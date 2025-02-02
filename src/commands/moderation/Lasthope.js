const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Забанити користувача з доступом лише до спеціального каналу.',
  async execute(message, args) {
    // Перевірка прав
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('У вас немає прав для цієї команди.');
    }

    // Отримати згаданого користувача
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Будь ласка, вкажіть користувача для бану.');
    }

    // Канал для бану
    const banChannelName = 'бан-апеляція';
    let banChannel = message.guild.channels.cache.find(ch => ch.name === banChannelName);

    // Якщо каналу немає — створити його
    if (!banChannel) {
      banChannel = await message.guild.channels.create({
        name: banChannelName,
        type: 0, // Текстовий канал
        permissionOverwrites: [
          {
            id: message.guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });
    }

    // Забираємо права користувача у всіх каналах
    const channels = message.guild.channels.cache;
    channels.forEach(channel => {
      channel.permissionOverwrites.edit(member.id, {
        ViewChannel: false,
      });
    });

    // Даємо доступ до каналу "бан-апеляція"
    await banChannel.permissionOverwrites.edit(member.id, {
      ViewChannel: true,
      SendMessages: true,
    });

    // Кнопка для тикета
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Створити тикет')
        .setStyle(ButtonStyle.Primary)
    );

    // Надсилаємо повідомлення
    await banChannel.send({
      content: `Привіт, ${member.user.username}. Ви були заблоковані. Якщо хочете оскаржити це, натисніть на кнопку нижче, щоб створити тикет.`,
      components: [row],
    });

    message.reply(`Користувача ${member.user.username} успішно заблоковано.`);
  },
};
