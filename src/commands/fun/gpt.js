const { OpenAI } = require('openai');
const { EmbedBuilder } = require('discord.js');

// API ключ OpenAI без використання .env
const openai = new OpenAI({
    apiKey: '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',  // Вставте ваш API ключ
});

module.exports = {
    name: 'gpt',
    aliases: ['ask', 'question'],
    description: 'Відповідь від GPT на ваше питання',
    category: "FUN",

    async messageRun(message, args) {
        const allowedChannelId = '1338261731234942986';  // Вказати ID каналу, в якому дозволено отримувати відповіді
        
        // Перевірка, чи повідомлення на правильному каналі
        if (message.channel.id !== allowedChannelId) {
            return;
        }

        // Якщо нема аргументів
        if (args.length === 0) {
            return message.reply('Будь ласка, напишіть питання!');
        }

        const question = args.join(' ');  // Обрізаємо аргументи

        // Перевірка на спеціальні питання
        if (question.toLowerCase().includes("хто тебе створив")) {
            return message.reply("Я не можу це сказати.");
        } else if (question.toLowerCase().includes("де ти живеш")) {
            return message.reply("Я не маю фізичного місця проживання, я віртуальний помічник.");
        } else if (question.toLowerCase().includes("що ти можеш робити")) {
            return message.reply("Я можу відповісти на питання, допомогти з кодом, давати поради і багато іншого!");
        } else if (question.toLowerCase().includes("чому ти не можеш це сказати")) {
            return message.reply("Це питання виходить за межі моїх можливостей або політики.");
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
                .setFooter({ text: `Запит від ${message.author.tag}` });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error from OpenAI:', error);
            message.reply('Виникла помилка при отриманні відповіді від GPT. Спробуйте пізніше.');
        }
    },
};
