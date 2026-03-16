const BOT_TOKEN = "8614503312:AAGq8QSpIdsP8gaAS1Q8TmYX69k4rG5FePg";

export default async function handler(req, res) {

  const body = req.body;

  if (body.message) {
    const chatId = body.message.chat.id;

    const reply = `Your Chat ID:\n${chatId}\n\nCopy this ID`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply
      })
    });
  }

  res.status(200).send("ok");
}
