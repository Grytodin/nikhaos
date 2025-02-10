const { OpenAI } = require('openai');
const { EmbedBuilder } = require('discord.js');

// API ключ OpenAI без використання .env
const openai = new OpenAI({
    apiKey: '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',  // Вставте ваш API ключ
});

module.exports = {
    data: {
        name: 'gpt',
        description: 'Відповідь від GPT на ваше питання',
        category: 'FUN',
        options: [
            {
                name: 'question',
                type: 'STRING',
                description: 'Ваше питання до GPT',
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const allowedChannelId = '1338261731234942986';  // Вказати ID каналу, в якому дозволено отримувати відповіді

        // Перевірка, чи повідомлення на правильному каналі
        if (interaction.channel.id !== allowedChannelId) {
            return interaction.reply('Ця команда доступна тільки в певному каналі.');
        }

        // Перевірка на спеціальні питання
        if (question.toLowerCase().includes("хто тебе створив")) {
            return interaction.reply("Я не можу це сказати.");
        } else if (question.toLowerCase().includes("де ти живеш")) {
            return interaction.reply("Я не маю фізичного місця проживання, я віртуальний помічник.");
        } else if (question.toLowerCase().includes("що ти можеш робити")) {
            return interaction.reply("Я можу відповісти на питання, допомогти з кодом, давати поради і багато іншого!");
        } else if (question.toLowerCase().includes("чому ти не можеш це сказати")) {
            return interaction.reply("Це питання виходить за межі моїх можливостей або політики.");
        }

        // Якщо питання не є спеціальним, відправляємо його в OpenAI
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo-16k',  // Можна замінити на GPT-4
                messages: [{ role: 'user', content: question }],
                max_tokens: 300,  // Обмежуємо кількість токенів для короткої відповіді
                temperature: 0.5,  // Контролюємо креативність, знижуємо температуру для лаконічних відповідей
                top_p: 1.0,  // Використовуємо стандартне значення для більш контрольованих відповідей
                frequency_penalty: 0,  // Немає додаткових штрафів для повторень
                presence_penalty: 0,  // Немає штрафів для нового змісту
            });

            const answer = response.choices[0].message.content.trim();  // Відрізаємо зайві пробіли

            // Створення embed повідомлення для відповіді
            const embed = new EmbedBuilder()
                .setColor('Random')  // Випадковий колір
                .setDescription(answer)
                .setFooter({ text: `Запит від ${interaction.user.tag}` });

            interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error from OpenAI:', error);
            interaction.reply('Виникла помилка при отриманні відповіді від GPT. Спробуйте пізніше.');
        }
    },
};
















const { OpenAI } = require('openai');
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const { MESSAGES, EMBED_COLORS } = require('@root/config.js');

/**
 * @type {import('@structures/Command')}
 */
module.exports = {
  name: 'gpt',
  aliases: ['ask', 'question'],
  description: 'Отримати відповідь від GPT на ваше питання',
  cooldown: 5,
  category: 'FUN',
  botPermissions: ['EmbedLinks'],
  command: {
    enabled: true,
    usage: '<question>',
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'question',
        description: 'Ваше питання до GPT',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    if (args.length === 0) {
      return message.safeReply('Будь ласка, напишіть питання!');
    }

    const question = args.join(' ');
    const response = await getGPTResponse(message.author, question);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const question = interaction.options.getString('question');
    const response = await getGPTResponse(interaction.user, question);
    await interaction.followUp(response);
  },
};

async function getGPTResponse(user, question) {
  try {
    const openai = new OpenAI({
      apiKey: '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',  // Вставте ваш API ключ
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: [{ role: 'user', content: question }],
      max_tokens: 300,
      temperature: 0.5,
    });

    const answer = response.choices[0].message.content.trim();

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setDescription(answer)
      .setFooter({ text: `Запит від ${user.tag}` });

    return { embeds: [embed] };
  } catch (error) {
    console.error('Error from OpenAI:', error);
    return MESSAGES.API_ERROR;
  }
}
