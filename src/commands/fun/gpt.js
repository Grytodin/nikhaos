const { Command } = require('@sapphire/framework');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: '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',
});

const userConversations = new Map();
const ignoredUsers = new Map();
const ignoreDuration = 10 * 60 * 1000; // 10 хвилин
const forbiddenWords = ['погане_слово1', 'погане_слово2']; // Замініть на реальні слова

class GptCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'gpt',
            description: 'Запитай у GPT',
        });
    }

    async messageRun(message, args) {
        const allowedChannelId = '1338261731234942986';

        if (message.channel.id !== allowedChannelId) {
            return message.reply('Ця команда доступна тільки в певному каналі.');
        }

        const userId = message.author.id;

        if (ignoredUsers.has(userId)) {
            return message.react('😡');
        }

        let question;

        if (message.reference) {
            try {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                if (referencedMessage.author.id === message.client.user.id) {
                    question = message.content.toLowerCase();
                }
            } catch (error) {
                console.error('❌ Помилка при отриманні повідомлення:', error);
            }
        }

        if (!question) {
            if (args.length === 0) {
                return message.reply('Будь ласка, напишіть питання!');
            }
            question = args.join(' ').toLowerCase();
        }

        if (forbiddenWords.some(word => question.includes(word))) {
            ignoredUsers.set(userId, true);
            setTimeout(() => ignoredUsers.delete(userId), ignoreDuration);
            return message.reply('😠 Ти мене образив... Я з тобою більше не говорю 10 хвилин.');
        }

        try {
            let conversation = userConversations.get(userId) || [];
            conversation.push({ role: 'user', content: question });

            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo-16k',
                messages: [
                    { role: 'system', content: 'Відповідай коротко, чітко, але не обрізай речення.' },
                    ...conversation,
                ],
                max_tokens: 150,
                temperature: 0.4,
                top_p: 0.5,
            });

            const answer = response.choices?.[0]?.message?.content?.trim() || 'Я не знаю, що відповісти.';
            const replyMessage = await message.reply(answer);

            conversation.push({ role: 'assistant', content: answer });
            userConversations.set(userId, conversation);
        } catch (error) {
            console.error('❌ Помилка від OpenAI:', error);
            await message.reply('Виникла помилка при отриманні відповіді від GPT. Спробуйте пізніше.');
        }
    }
}

module.exports = {
    GptCommand,
};