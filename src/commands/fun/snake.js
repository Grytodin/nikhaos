const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "snake",
  description: "Play a snake game using buttons",
  cooldown: 10,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "ReadMessageHistory"],

  command: { enabled: true },
  slashCommand: { enabled: true },

  async messageRun(message) {
    await startSnakeGame(message);
  },

  async interactionRun(interaction) {
    await startSnakeGame(interaction);
  },
};

async function startSnakeGame(data) {
  const gridSize = 7; // Розмір поля
  let snake = [{ x: 3, y: 3 }]; // Початкова позиція
  let direction = "RIGHT"; // Початковий напрямок
  let food = getRandomFood(); // Їжа
  let gameOver = false;

  const controls = () => new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("UP").setLabel("⬆").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("LEFT").setLabel("⬅").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("DOWN").setLabel("⬇").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("RIGHT").setLabel("➡").setStyle(ButtonStyle.Primary)
  );

  let embed = createEmbed();
  let message = await data.reply({ embeds: [embed], components: [controls()] });

  const collector = message.createMessageComponentCollector({ time: 60000 });

  collector.on("collect", async (interaction) => {
    if (gameOver) return;
    if (interaction.user.id !== data.author.id) {
      return interaction.reply({ content: "Це не твоя гра!", ephemeral: true });
    }

    direction = interaction.customId; // Оновлюємо напрямок

    moveSnake();
    if (gameOver) {
      collector.stop();
      embed = createEmbed(true);
      await interaction.update({ embeds: [embed], components: [] });
    } else {
      embed = createEmbed();
      await interaction.update({ embeds: [embed], components: [controls()] });
    }
  });

  function moveSnake() {
    const head = { ...snake[0] };

    if (direction === "UP") head.y -= 1;
    if (direction === "DOWN") head.y += 1;
    if (direction === "LEFT") head.x -= 1;
    if (direction === "RIGHT") head.x += 1;

    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || isSnakeCollision(head)) {
      gameOver = true;
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      food = getRandomFood();
    } else {
      snake.pop();
    }
  }

  function isSnakeCollision(pos) {
    return snake.some(segment => segment.x === pos.x && segment.y === pos.y);
  }

  function getRandomFood() {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
    } while (isSnakeCollision(newFood));
    return newFood;
  }

  function createEmbed(isGameOver = false) {
    let grid = Array.from({ length: gridSize }, () => Array(gridSize).fill("⬛"));
    snake.forEach(segment => (grid[segment.y][segment.x] = "🟩"));
    grid[food.y][food.x] = "🍎";

    return new EmbedBuilder()
      .setTitle("🐍 Snake Game")
      .setDescription(grid.map(row => row.join("")).join("\n"))
      .setColor(isGameOver ? "Red" : "Green")
      .setFooter({ text: isGameOver ? "Game Over!" : "Use buttons to move!" });
  }
}