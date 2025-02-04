const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
  name: "snake",
  description: "Play Snake game on Discord",
  cooldown: 10,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    await message.safeReply("**Starting Snake Game** (only you can see it)");
    await startSnakeGame(message, false);
  },

  async interactionRun(interaction) {
    await interaction.reply({ content: "", ephemeral: true });
    await startSnakeGame(interaction, true);
  },
};

const GAME_SIZE = { rows: 12, cols: 15 };
const DIRECTIONS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

function createBoard() {
    return Array.from({ length: GAME_SIZE.rows }, () => Array(GAME_SIZE.cols).fill('🟦'));  // Замінив '🔵' на '🟦'
}

function spawnFood(board, snake) {
    let x, y;
    do {
        x = Math.floor(Math.random() * GAME_SIZE.cols);
        y = Math.floor(Math.random() * GAME_SIZE.rows);
    } while (board[y][x] !== '🟦' || snake.some(segment => segment.x === x && segment.y === y));
    return { x, y };
}

async function startSnakeGame(data, isInteraction) {
    let board = createBoard();
    let snake = [{ x: 7, y: 6 }];
    let food = spawnFood(board, snake);
    let direction = DIRECTIONS.right;
    
    function updateBoard() {
        board = createBoard();
        snake.forEach(segment => board[segment.y][segment.x] = '🟩');
        board[snake[0].y][snake[0].x] = '🟢'; // Голова змії
        board[food.y][food.x] = '🍎';
    }
    
    updateBoard();
    let embed = new EmbedBuilder().setTitle("Snake Game").setDescription(renderBoard(board));
    let msg = await data.channel.send({ embeds: [embed], components: [createButtons()] });

    let collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
    collector.on('collect', async interaction => {
        if (interaction.user.id !== (isInteraction ? data.user.id : data.author.id)) {
            return interaction.reply({ content: "This is not your game!", ephemeral: true });
        }
        direction = DIRECTIONS[interaction.customId];
        
        let newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        if (newHead.x < 0 || newHead.x >= GAME_SIZE.cols || newHead.y < 0 || newHead.y >= GAME_SIZE.rows ||
            snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            collector.stop('gameover');
            return interaction.update({ embeds: [embed.setDescription('Game Over!')], components: [] });
        }
        snake.unshift(newHead);
        if (newHead.x === food.x && newHead.y === food.y) {
            food = spawnFood(board, snake);
        } else {
            snake.pop();
        }
        updateBoard();
        embed.setDescription(renderBoard(board));
        await interaction.update({ embeds: [embed] });
    });
}

function renderBoard(board) {
    return board.map(row => row.join('')).join('\n');
}

function createButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('up').setEmoji('⬆️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('left').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('down').setEmoji('⬇️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('right').setEmoji('➡️').setStyle(ButtonStyle.Primary)
    );
}
