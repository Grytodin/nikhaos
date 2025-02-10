
const { OpenAI } = require('openai');
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const { EMBED_COLORS } = require('@root/config');

// Використовуйте змінну оточення для API ключа
const openai = new OpenAI({
    apiKey: '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', // Додайте ключ у змінні оточення
});

const ignoredUsers = new Map();
const ignoreDuration = 10 * 60 * 1000;  // 10 хвилин

const forbiddenWords = ['дурак', 'придурок', 'тупий', 'лох', 'чмо'];  // Образливі слова

const choices = ["who created you", "where do you live", "what can you do", "why can't you say this"];

module.exports = {
    name: 'gpt',
    description: 'Відповідь від GPT на ваше питання',
    cooldown: 5,
    category: 'FUN',
    botPermissions: ['EmbedLinks'],

    // Префіксна команда
    command: {
        enabled: true,
        usage: '<питання>',
        aliases: ['ask', 'question'],
        minArgsCount: 1,
    },

    // Slash-команда
    slashCommand: {
        enabled: true,
        options: [
            {
                name: 'question',
                description: 'Your question for GPT',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    // Обробка префіксної команди
    async messageRun(message, args) {
        const allowedChannelId = '1338261731234942986';  // ID дозволеного каналу

        // Перевірка каналу
        if (message.channel.id !== allowedChannelId) {
            return message.reply('Ця команда доступна тільки в певному каналі.');
        }

        const userId = message.author.id;

        // Перевірка на ігнорування
        if (ignoredUsers.has(userId)) {
            return message.react('😡');
        }

        // Перевірка на наявність питання
        if (args.length === 0) {
            return message.reply('Будь ласка, напишіть питання!');
        }

        const question = args.join(' ').toLowerCase();

        // Перевірка на образливі слова
        if (forbiddenWords.some(word => question.includes(word))) {
            ignoredUsers.set(userId, true);
            setTimeout(() => ignoredUsers.delete(userId), ignoreDuration);
            return message.reply('😠 Ти мене образив... Я з тобою більше не говорю 10 хвилин.');
        }

        // Обробка спеціальних запитань
        if (choices.includes(question)) {
            const response = await handleSpecialQuestions(question, message.author);
            return message.reply({ embeds: [response] });
        }

        try {
            // Запит до OpenAI
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo-16k',
                messages: [
                    { role: 'system', content: 'Відповідай коротко, чітко, але не обрізай речення.' },
                    { role: 'user', content: question },
                ],
                max_tokens: 150,
                temperature: 0.4,
                top_p: 0.5,
            });

            const answer = response.choices?.[0]?.message?.content?.trim() || 'Я не знаю, що відповісти.';
            await message.reply(answer);
        } catch (error) {
            console.error('❌ Помилка від OpenAI:', error);
            await message.reply('Виникла помилка при отриманні відповіді від GPT. Спробуйте пізніше.');
        }
    },

    // Обробка Slash-команди
    async interactionRun(interaction) {
        const question = interaction.options.getString('question').toLowerCase();

        // Обробка спеціальних запитань
        if (choices.includes(question)) {
            const response = await handleSpecialQuestions(question, interaction.user);
            return interaction.followUp({ embeds: [response] });
        }

        try {
            // Запит до OpenAI
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Відповідай коротко, чітко, але не обрізай речення.' },
                    { role: 'user', content: question },
                ],
                max_tokens: 150,
                temperature: 0.4,
                top_p: 0.5,
            });

            const answer = response.choices?.[0]?.message?.content?.trim() || 'Я не знаю, що відповісти.';
            await interaction.followUp(answer);
        } catch (error) {
            console.error('❌ Помилка від OpenAI:', error);
            await interaction.followUp('Виникла помилка при отриманні відповіді від GPT. Спробуйте пізніше.');
        }
    },
};

// Обробка спеціальних запитань
async function handleSpecialQuestions(question, user) {
    let responseMessage = '';

    switch (question) {
        case 'who created you':
            responseMessage = 'Я не можу це сказати.';
            break;
        case 'where do you live':
            responseMessage = 'Я не маю фізичного місця проживання, я віртуальний помічник.';
            break;
        case 'what can you do':
            responseMessage = 'Я можу відповідати на запитання, допомагати з кодом, давати поради і багато іншого!';
            break;
        case 'why can\'t you say this':
            responseMessage = 'Це питання виходить за межі моїх можливостей або політики.';
            break;
        default:
            responseMessage = 'Це питання не підтримується.';
    }

    return new EmbedBuilder()
        .setDescription(responseMessage)
        .setColor(EMBED_COLORS.INFO)
        .setFooter({ text: `Запит від ${user.tag}` });
}
