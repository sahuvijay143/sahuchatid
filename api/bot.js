const TOKEN = "8614503312:AAGq8QSpIdsP8gaAS1Q8TmYX69k4rG5FePg";
const OWNER_ID = 6941192709;

let users = new Set();

async function sendMessage(chatId, text, keyboard = null) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      reply_markup: keyboard
    })
  });
}

export default async function handler(req, res) {

  const body = req.body;

  if (body.message) {

    const chatId = body.message.chat.id;
    const text = body.message.text;

    users.add(chatId);

    // START COMMAND
    if (text === "/start") {

      const message = `
<b>👋 Welcome to SAHU CHAT ID FIND</b>

📌 Your Chat ID:
<code>${chatId}</code>

Click and Copy your Chat ID easily.

⚡ Features
• Find Chat ID
• Easy Copy
• Fast Bot

Developer : SAHU
`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: "📋 Copy Chat ID", callback_data: "copy" }
          ],
          [
            { text: "🤖 Bot Info", callback_data: "info" }
          ]
        ]
      };

      await sendMessage(chatId, message, keyboard);
    }

    // BROADCAST
    if (chatId === OWNER_ID && text.startsWith("/broadcast")) {

      const msg = text.replace("/broadcast ", "");

      for (let id of users) {
        await sendMessage(id, `📢 <b>Broadcast Message</b>\n\n${msg}`);
      }

      await sendMessage(chatId, `✅ Broadcast Sent\n👥 Users : ${users.size}`);
    }

    // USER COUNT
    if (chatId === OWNER_ID && text === "/users") {

      await sendMessage(chatId, `👥 Total Users : ${users.size}`);
    }

  }

  res.status(200).send("ok");

}
