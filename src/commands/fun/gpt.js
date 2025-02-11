async messageRun(message, args) {  
    const allowedChannelId = '1338261731234942986';

    // Перевірка каналу  
    if (message.channel.id !== allowedChannelId) {  
        return message.reply('Ця команда доступна тільки в певному каналі.');  
    }  

    const userId = message.author.id;  

    // Перевірка на ігнорування  
    if (ignoredUsers.has(userId)) {  
        return message.react('😡');  
    }  

    let question;
    
    // Якщо це відповідь на повідомлення бота
    if (message.reference) {
        try {
            const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
            if (referencedMessage.author.id === message.client.user.id) {
                // Відновлюємо історію діалогу
                question = message.content.toLowerCase();
            }
        } catch (error) {
            console.error('❌ Помилка при отриманні повідомлення:', error);
        }
    }

    // Якщо питання не визначене через відповідь на бота, беремо його з аргументів
    if (!question) {
        if (args.length === 0) {  
            return message.reply('Будь ласка, напишіть питання!');  
        }
        question = args.join(' ').toLowerCase();
    }

    // Перевірка на образливі слова  
    if (forbiddenWords.some(word => question.includes(word))) {  
        ignoredUsers.set(userId, true);  
        setTimeout(() => ignoredUsers.delete(userId), ignoreDuration);  
        return message.reply('😠 Ти мене образив... Я з тобою більше не говорю 10 хвилин.');  
    }  

    try {  
        // Отримуємо історію діалогу для користувача
        let conversation = userConversations.get(userId) || [];
        conversation.push({ role: 'user', content: question });

        // Запит до OpenAI  
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

        // Зберігаємо відповідь бота в історію діалогу
        conversation.push({ role: 'assistant', content: answer });
        userConversations.set(userId, conversation);
    } catch (error) {  
        console.error('❌ Помилка від OpenAI:', error);  
        await message.reply('Виникла помилка при отриманні відповіді від GPT. Спробуйте пізніше.');  
    }  
}