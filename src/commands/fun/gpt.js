module.exports = {
    name: 'gpt',
    aliases: ['ask', 'question'],
    description: 'Відповідь від GPT на ваше питання',

    async messageRun(message, args) {
        // Перевірка на тип повідомлення
        if (!message.content.startsWith('!gpt')) return;  // Якщо не команду з !gpt, то не обробляємо

        // Якщо команда викликана не в дозволеному каналі — ігноруємо
        const allowedChannelId = '1338261731234942986';  
        if (message.channel.id !== allowedChannelId) return;

        const userId = message.author.id;

        // Якщо користувач в списку ігнорованих — бот його "ображено" і не відповідає
        if (ignoredUsers.has(userId)) {
            return message.react('😡');
        }

        // Якщо нема аргументів
        if (args.length === 0) {
            return message.reply('Будь ласка, напишіть питання!');
        }

        const question = args.join(' ').toLowerCase();  // Обрізаємо аргументи

        // Перевірка на образливі слова
        const forbiddenWords = ['дурак', 'придурок', 'тупий', 'лох', 'чмо'];
        if (forbiddenWords.some(word => question.includes(word))) {
            ignoredUsers.set(userId, true);
            setTimeout(() => ignoredUsers.delete(userId), ignoreDuration);
            return message.reply('😠 Ти мене образив... Я з тобою більше не говорю 10 хвилин.');
        }

        // Запит до OpenAI
        try {
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
            message.reply(answer);
        } catch (error) {
            console.error('❌ Error from OpenAI:', error);
            message.reply('Виникла помилка при отриманні відповіді від GPT. Спробуйте пізніше.');
        }
    },
};
