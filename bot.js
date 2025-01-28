const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const schedule = require("node-schedule");

// Set up the bot

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Required to read messages
  ],
});

//const CHANNEL_ID =  "1332496853765455954"
const CHANNEL_ID =  "1285595155901976610"
const TOKEN = "DISCORD_BOT_TOKEN"; // Replace with your bot token

// Blockchain API
const API_URL = "http://localhost:8589"; // Replace with your blockchain node URL
const RPC_USER = "YOUR_RPC_USERNAME"; // Replace with your RPC username
const RPC_PASSWORD = "YOUR_RPC_PASSWORD"; // Replace with your RPC password

// Fetch hash rate
async function getHashRate() {
  try {
    const response = await axios.post(
      API_URL,
      {
        jsonrpc: "1.0",
        id: "curltext",
        method: "getnetworkhashps",
        params: [],
      },
      {
        auth: {
          username: RPC_USER,
          password: RPC_PASSWORD,
        },
      }
    );
    return response.data.result;
  } catch (error) {
    console.error("Error fetching hash rate:", error.message);
    return null;
  }
}

// Get a greeting based on time of day
function getRandomGreeting(isEvening) {
  const greetings = {
    morning: {
      english: "Good Morning",
      finnish: "Hyvää huomenta",
      estonian: "Tere hommikust",
      chinese: "早上好",
      japanese: "おはようございます"
    },
    evening: {
      english: "Good Evening",
      finnish: "Hyvää iltaa",
      estonian: "Tere õhtust",
      chinese: "晚上好",
      japanese: "こんばんは"
    }
  };

  const timeOfDay = isEvening ? 'evening' : 'morning';
  const keys = Object.keys(greetings[timeOfDay]);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return greetings[timeOfDay][randomKey];
}

// Send hash rate to the channel
async function sendHashRate(isEvening = false) {
  const hashRate = await getHashRate();
  if (hashRate) {
    const greeting = getRandomGreeting(isEvening);
    const message = `${greeting}. The Unicity PoW Hash Rate is currently ${(hashRate / 1e3).toFixed(2)} KH/s.`;
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) {
      channel.send(message);
    } else {
      console.error("Channel not found");
    }
  } else {
    console.error("Unable to fetch hash rate. Please check the node or API.");
  }
}

// Schedule morning task at 7 AM daily
schedule.scheduleJob("0 5 * * *", async () => {
  console.log("Fetching and sending hash rate at 7 AM...");
  await sendHashRate(false);
});

// Schedule evening task at 9 PM daily
schedule.scheduleJob("3 23 * * *", async () => {
  console.log("Fetching and sending hash rate at 11 PM...");
  await sendHashRate(true);
});



// Listen for messages
client.on("messageCreate", async (message) => {
  if (message.content === "!hashrate") {
    const hashRate = await getHashRate(false);
    if (hashRate) {
      message.channel.send(`The current hash rate is ${(hashRate / 1e3).toFixed(2)} KH/s.`);
    } else {
      message.channel.send("Unable to fetch hash rate. Please check the node or API.");
    }
  }
  if (message.content === "!testhashrate") {
    // Test the 7 AM hash rate function manually
    await sendHashRate(false);
    message.channel.send("Test: The hash rate has been sent to the channel.");
  }
});


// Log in to Discord
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Log in to Discord
client.login(TOKEN);
