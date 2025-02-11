module.exports = {
  OWNER_IDS: ["705135021371031563"], // Bot owner ID's
  SUPPORT_SERVER: "1316135510753808406", // Your bot support server
  PREFIX_COMMANDS: {
    ENABLED: true, // Enable/Disable prefix commands
    DEFAULT_PREFIX: "!", // Default prefix for the bot
  },
  INTERACTIONS: {
    SLASH: true, // Enable slash commands
    CONTEXT: true, // Enable context commands
    GLOBAL: true, // Register commands globally
    TEST_GUILD_ID: "xxxxxxxxxxx", // Test guild ID for slash commands
  },
  EMBED_COLORS: {
    BOT_EMBED: "#068ADD",
    TRANSPARENT: "#36393F",
    SUCCESS: "#00A56A",
    ERROR: "#D61A3C",
    WARNING: "#F7E919",
  },
  CACHE_SIZE: {
    GUILDS: 100,
    USERS: 10000,
    MEMBERS: 10000,
  },
  MESSAGES: {
    API_ERROR: "Unexpected Backend Error! Try again later or contact support server",
  },

  // PLUGINS

  AUTOMOD: {
    ENABLED: false, // Enable auto-moderation
    LOG_EMBED: "#36393F",
    DM_EMBED: "#36393F",
  },

  DASHBOARD: {
    enabled: true, // Disable dashboard by default
    baseURL: "http://localhost:8080", // Base URL
    failureURL: "http://localhost:8080", // Failure redirect URL
    port: "8080", // Port to run the dashboard on
  },

  ECONOMY: {
    ENABLED: true, // Enable economy system
    CURRENCY: "🪙",
    DAILY_COINS: 100, // Coins for daily command
    MIN_BEG_AMOUNT: 100, // Minimum beg amount
    MAX_BEG_AMOUNT: 2500, // Maximum beg amount
  },

  MUSIC: {
    ENABLED: true, // Enable music system
    IDLE_TIME: 60, // Time before bot disconnects from idle VC
    MAX_SEARCH_RESULTS: 5,
    DEFAULT_SOURCE: "YT", // Default music source
    LAVALINK_NODES: [
      {
        host: "localhost",
        port: 2333,
        password: "youshallnotpass",
        id: "Local Node",
        secure: false,
      },
    ],
  },

  GIVEAWAYS: {
    ENABLED: true, // Enable giveaways
    REACTION: "🎁",
    START_EMBED: "#FF468A",
    END_EMBED: "#FF468A",
  },

  IMAGE: {
    ENABLED: true, // Enable image commands
    BASE_API: "https://strangeapi.hostz.me/api",
  },

  INVITE: {
    ENABLED: true, // Enable invite system
  },

  MODERATION: {
    ENABLED: true, // Enable moderation
    EMBED_COLORS: {
      TIMEOUT: "#102027",
      UNTIMEOUT: "#4B636E",
      KICK: "#FF7961",
      SOFTBAN: "#AF4448",
      BAN: "#D32F2F",
      UNBAN: "#00C853",
      VMUTE: "#102027",
      VUNMUTE: "#4B636E",
      DEAFEN: "#102027",
      UNDEAFEN: "#4B636E",
      DISCONNECT: "RANDOM",
      MOVE: "RANDOM",
    },
  },

  PRESENCE: {
    ENABLED: true, // Enable bot presence
    STATUS: "idle", // Bot status [online, idle, dnd, invisible]
    TYPE: "WATCHING", // Presence type [PLAYING, LISTENING, WATCHING, COMPETING]
    MESSAGE: "ATTENTION!!! The bot is still in development.The release stage will be published on the support server below.", // Status message
  },

  STATS: {
    ENABLED: true, // Enable leveling system
    XP_COOLDOWN: 5, // Cooldown in seconds between messages
    DEFAULT_LVL_UP_MSG: "{member:tag}, You just advanced to **Level {level}**",
  },

  SUGGESTIONS: {
    ENABLED: true, // Enable suggestions
    EMOJI: {
      UP_VOTE: "⬆️",
      DOWN_VOTE: "⬇️",
    },
    DEFAULT_EMBED: "#4F545C",
    APPROVED_EMBED: "#43B581",
    DENIED_EMBED: "#F04747",
  },

  TICKET: {
    ENABLED: true, // Enable ticketing system
    CREATE_EMBED: "#068ADD",
    CLOSE_EMBED: "#068ADD",
  },
};
