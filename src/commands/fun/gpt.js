
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: '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',  
});

const ignoredUsers = new Map();  // Список користувачів, яких бот ігнорує
const ignoreDuration = 10 * 60 * 1000;  // 10 хвилин у мілісекундах

module.exports = {
    name: 'gpt',
    aliases: ['ask', 'question'],
    description: 'Відповідь від GPT на ваше питання',
    
    async messageRun(message, args) {
        const allowedChannelId = '1338261731234942986';  // ID дозволеного каналу

        // Якщо команда викликана не в дозволеному каналі — ігноруємо
        if (message.channel.id !== allowedChannelId) return;

        const userId = message.author.id;

        // Якщо користувач в списку ігнорованих — бот його "ображено" і не відповідає
        if (ignoredUsers.has(userId)) {
            return message.react('😡'); // Реагуємо емодзі, але не відповідаємо
        }

        if (args.length === 0) {
            return message.reply('Будь ласка, напишіть питання!');
        }

        const question = args.join(' ').toLowerCase();  // Об’єднуємо аргументи в питання

        // Список слів, за які бот буде ображатися
        const forbiddenWords = ['дурак', 'придурок', 'тупий', 'лох', 'чмо'];

        // Якщо користувач написав щось образливе — бот ображається
        if (forbiddenWords.some(word => question.includes(word))) {
            ignoredUsers.set(userId, true); // Додаємо в ігнор
            setTimeout(() => ignoredUsers.delete(userId), ignoreDuration); // Знімаємо ігнор через 10 хв
            return message.reply('😠 Ти мене образив... Я з тобою більше не говорю 10 хвилин.');
        }

        // Перевірка на спеціальні питання через switch (оптимізовано)
        switch (true) {
            case question.includes("хто тебе створив"):
                return message.reply("Я не можу це сказати.");
            case question.includes("де ти живеш"):
                return message.reply("Я не маю фізичного місця проживання, я віртуальний помічник.");
            case question.includes("що ти можеш робити"):
                return message.reply("Я можу відповідати на запитання, допомагати з кодом, давати поради і багато іншого!");
            case question.includes("чому ти не можеш це сказати"):
                return message.reply("Це питання виходить за межі моїх можливостей або політики.");
        }

        // Запит до OpenAI
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo-16k',
                messages: [
                    { role: 'system', content: "Відповідай коротко, чітко, але не обрізай речення." },
                    { role: 'user', content: question }
                ],
                max_tokens: 150,  // Обмежуємо довжину відповіді
                temperature: 0.4,  // Менша креативність, чіткіші відповіді
                top_p: 0.5
            });

            const answer = response.choices?.[0]?.message?.content?.trim() || "Я не знаю, що відповісти.";
            message.reply(answer);
        } catch (error) {
            console.error('❌ Error from OpenAI:', error);
            message.reply('Виникла помилка при отриманні відповіді від GPT. Спробуйте пізніше.');
        }
    },
};
