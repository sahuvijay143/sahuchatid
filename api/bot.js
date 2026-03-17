import { MongoClient } from "mongodb";

const TOKEN = "8614503312:AAGq8QSpIdsP8gaAS1Q8TmYX69k4rG5FePg";
const OWNER_ID = "6941192709";

let client;
let db;

async function getDB() {
  if (!db) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db("telegram").collection("users");
  }
  return db;
}

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML"
    })
  });
}

export default async function handler(req, res) {
  try {
    const body = req.body;

    if (!body.message) {
      return res.status(200).send("ok");
    }

    const message = body.message;
    const chatId = String(message.chat.id);

    // 🔥 TEXT SAFE FIX
    let text = "";
    if (message.text) {
      text = message.text.trim();
    }

    // 🔥 REMOVE BOT USERNAME (/admin@botname fix)
    if (text.includes("@")) {
      text = text.split("@")[0];
    }

    const usersDB = await getDB();

    // SAVE USER
    await usersDB.updateOne(
      { chatId },
      { $set: { chatId } },
      { upsert: true }
    );

    // START
    if (text === "/start") {
      await sendMessage(chatId,
`📌 Your Chat ID

<code>${chatId}</code>

⚡ Fast • Simple • Permanent Bot

Developer : SAHU`);
    }

    // OWNER CHECK
    const isOwner = chatId === OWNER_ID;

    // ADMIN PANEL
    if (isOwner && text === "/admin") {
      await sendMessage(chatId,
`⚙️ ADMIN PANEL

👥 /users
📢 /broadcast message
🖼 /photo url
🔘 /button text|link`);
    }

    // USERS
    if (isOwner && text === "/users") {
      const count = await usersDB.countDocuments();
      await sendMessage(chatId, `👥 Total Users : ${count}`);
    }

    // BROADCAST
    if (isOwner && text.startsWith("/broadcast")) {

      const msg = text.replace("/broadcast", "").trim();

      if (!msg) {
        return await sendMessage(chatId, "❌ Message likho\nExample:\n/broadcast hello");
      }

      const allUsers = await usersDB.find().toArray();

      let sent = 0;

      for (let user of allUsers) {
        try {
          await sendMessage(user.chatId, `📢 ${msg}`);
          sent++;
        } catch {}
      }

      await sendMessage(chatId, `✅ Broadcast Done\nSent: ${sent}`);
    }

    res.status(200).send("ok");

  } catch (err) {
    console.log("ERROR:", err);
    res.status(200).send("error handled");
  }
}
