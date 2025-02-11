const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

const GAME_SIZE = { rows: 12, cols: 15 };
const DIRECTIONS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

function createBoard() {
return Array.from({ length: GAME_SIZE.rows }, () => Array(GAME_SIZE.cols).fill('🟦'));
}

function spawnFood(board, snake) {
let x, y;
do {
x = Math.floor(Math.random() * GAME_SIZE.cols);
y = Math.floor(Math.random() * GAME_SIZE.rows);
} while (snake.some(segment => segment.x === x && segment.y === y));
return { x, y };
}

async function startSnakeGame(data, isInteraction) {
let board = createBoard();
let snake = [{ x: 7, y: 6 }];
let food = spawnFood(board, snake);
let direction = DIRECTIONS.right;
let gameOver = false;
let score = 0;

function updateBoard() {  
    board = createBoard();  
    snake.forEach(segment => board[segment.y][segment.x] = '🟩');  
    board[snake[0].y][snake[0].x] = '🟢';  
    board[food.y][food.x] = '🍎';  
}  

function moveSnake() {  
    if (gameOver) return;  
    let newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };  

    if (newHead.x < 0 || newHead.x >= GAME_SIZE.cols || newHead.y < 0 || newHead.y >= GAME_SIZE.rows ||  
        snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {  
        gameOver = true;  
        return "gameover";  
    }  

    snake.unshift(newHead);  
    if (newHead.x === food.x && newHead.y === food.y) {  
        food = spawnFood(board, snake);  
        score++;  
    } else {  
        snake.pop();  
    }  

    updateBoard();  
    return renderBoard(board);  
}  

updateBoard();  
let embed = new EmbedBuilder().setTitle("🐍 Snake Game").setDescription(renderBoard(board) + `\n**Score:** ${score}`);  
let msg = await data.channel.send({ embeds: [embed], components: [createButtons()] });  

let collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, idle: 300000 });  

collector.on('collect', async interaction => {  
    if (interaction.user.id !== (isInteraction ? data.user.id : data.author.id)) {  
        return interaction.reply({ content: "❌ Це не ваша гра!", ephemeral: true });  
    }  

    await interaction.deferUpdate();  
    direction = DIRECTIONS[interaction.customId];  
    let result = moveSnake();  

    if (result === "gameover") {  
        collector.stop();  
        return interaction.editReply({ embeds: [embed.setDescription(`☠ **Game Over!**\nFinal Score: ${score}`)], components: [] }).catch(() => {});  
    }  

    interaction.editReply({ embeds: [embed.setDescription(result + `\n**Score:** ${score}`)] }).catch(() => {});  
});  

collector.on('end', (_, reason) => {  
    if (reason === "idle") {  
        msg.edit({ embeds: [embed.setDescription("⏳ **Гру завершено через неактивність!**")], components: [] }).catch(() => {});  
    }  
    gameOver = true;  
});

}

function renderBoard(board) {
return board.map(row => row.join('')).join('\n');
}

function createButtons() {
return new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId('left').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId('right').setEmoji('➡️').setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId('up').setEmoji('⬆️').setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId('down').setEmoji('⬇️').setStyle(ButtonStyle.Primary)
);
}

module.exports = {
name: "snake",
description: "Play Snake game on Discord",
cooldown: 10,
category: "FUN",
botPermissions: ["SendMessages", "EmbedLinks", "ReadMessageHistory"],
command: { enabled: true },
slashCommand: { enabled: true },

async messageRun(message) {  
    await message.reply("**Ігра в змійку**");  
    await startSnakeGame(message, false);  
},  

async interactionRun(interaction) {  
    await interaction.reply({ content: "", ephemeral: true });  
    await startSnakeGame(interaction, true);  
}

};

