import { MongoClient } from "mongodb";

const TOKEN = "8614503312:AAGq8QSpIdsP8gaAS1Q8TmYX69k4rG5FePg";
const OWNER_ID = "6941192709";

const client = new MongoClient(process.env.MONGO_URI);

async function getDB() {
  if (!client.topology?.isConnected()) await client.connect();
  return client.db("telegram").collection("users");
}

async function sendMessage(chatId, text, keyboard=null) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: keyboard
    })
  });
}

async function sendPhoto(chatId, photo, caption="") {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      chat_id: chatId,
      photo,
      caption
    })
  });
}

export default async function handler(req, res) {

  const body = req.body;
  if (!body.message) return res.status(200).send("ok");

  const chatId = String(body.message.chat.id);
  const text = body.message.text;

  const usersDB = await getDB();

  // SAVE USER
  await usersDB.updateOne(
    { chatId },
    { $set: { chatId } },
    { upsert: true }
  );

  // START
  if (text === "/start") {

    const keyboard = {
      inline_keyboard: [
        [{ text: "📋 Copy Chat ID", callback_data: "copy" }],
        [{ text: "🤖 Bot Info", callback_data: "info" }]
      ]
    };

    await sendMessage(chatId,
`📌 <b>Your Chat ID</b>

<code>${chatId}</code>

⚡ Fast • Simple • Permanent Bot

Developer : SAHU`, keyboard);
  }

  // ADMIN PANEL
  if (chatId === OWNER_ID && text === "/admin") {

    await sendMessage(chatId,
`⚙️ <b>ADMIN PANEL</b>

👥 /users
📢 /broadcast text
🖼 /photo url
🔘 /button text|link`);
  }

  // USERS COUNT
  if (chatId === OWNER_ID && text === "/users") {

    const count = await usersDB.countDocuments();

    await sendMessage(chatId,
`👥 Total Users : ${count}`);
  }

  // TEXT BROADCAST
  if (chatId === OWNER_ID && text.startsWith("/broadcast")) {

    const msg = text.replace("/broadcast ", "");
    const allUsers = await usersDB.find().toArray();

    let sent = 0;

    for (let user of allUsers) {
      try {
        await sendMessage(user.chatId, `📢 ${msg}`);
        sent++;
      } catch {}
    }

    await sendMessage(chatId,
`✅ Broadcast Done

Sent : ${sent}`);
  }

  // PHOTO BROADCAST
  if (chatId === OWNER_ID && text.startsWith("/photo")) {

    const url = text.replace("/photo ", "");
    const allUsers = await usersDB.find().toArray();

    for (let user of allUsers) {
      try {
        await sendPhoto(user.chatId, url, "📢 Broadcast");
      } catch {}
    }

    await sendMessage(chatId, "✅ Photo Broadcast Sent");
  }

  // BUTTON BROADCAST
  if (chatId === OWNER_ID && text.startsWith("/button")) {

    const data = text.replace("/button ", "").split("|");
    const btnText = data[0];
    const btnLink = data[1];

    const keyboard = {
      inline_keyboard: [
        [{ text: btnText, url: btnLink }]
      ]
    };

    const allUsers = await usersDB.find().toArray();

    for (let user of allUsers) {
      try {
        await sendMessage(user.chatId, "📢 Click Below", keyboard);
      } catch {}
    }

    await sendMessage(chatId, "✅ Button Broadcast Sent");
  }

  res.status(200).send("ok");
}
