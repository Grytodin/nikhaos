const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
  // Перевірка, чи користувач має дозвіл на бан
  const perms = await client.checkPerms({
    flags: [Discord.PermissionsBitField.Flags.BanMembers],
    perms: [Discord.PermissionsBitField.Flags.BanMembers]
  }, interaction);

  // Вихід, якщо прав недостатньо
  if (!perms) return;

  // Отримання учасника для бана
  const member = await interaction.guild.members.fetch(
    interaction.options.getUser('user').id
  );

  // Отримання причини бана або встановлення за замовчуванням
  const reason = interaction.options.getString('reason') || 'Not given';

  // Захист від бана модераторів
  if (member.permissions.has(Discord.PermissionsBitField.Flags.BanMembers)) {
    return client.errNormal({
      error: "You can't ban a moderator",
      type: 'editreply'
    }, interaction);
  }

  // Спроба надіслати повідомлення в DM перед баном
  client.embed({
    title: '🔨・Ban',
    desc: `You've been banned in **${interaction.guild.name}**`,
    fields: [
      {
        name: '👤┆Banned by',
        value: interaction.user.tag,
        inline: true
      },
      {
        name: '💬┆Reason',
        value: reason,
        inline: true
      }
    ]
  }, member).then(() => {
    // Якщо повідомлення вдалося надіслати — виконується бан
    member.ban({ reason });

    // Підтвердження бана з повідомленням у DM
    client.succNormal({
      text: 'The specified user has been successfully banned and successfully received a notification!',
      fields: [
        {
          name: '👤┆Banned user',
          value: member.user.tag,
          inline: true
        },
        {
          name: '💬┆Reason',
          value: reason,
          inline: true
        }
      ],
      type: 'editreply'
    }, interaction);
  }).catch(() => {
    // Якщо не вдалося надіслати повідомлення — все одно банимо
    member.ban({ reason });

    // Підтвердження бана без повідомлення в DM
    client.succNormal({
      text: 'The given user has been successfully banned, but has not received a notification!',
      type: 'editreply'
    }, interaction);
  });
};