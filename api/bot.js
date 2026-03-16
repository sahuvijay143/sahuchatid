const TOKEN = "8614503312:AAGq8QSpIdsP8gaAS1Q8TmYX69k4rG5FePg";
const OWNER_ID = 6941192709;

let users = new Set();

async function sendMessage(chatId, text, keyboard=null){

await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
chat_id:chatId,
text:text,
parse_mode:"HTML",
reply_markup:keyboard
})
})

}

async function sendPhoto(chatId,photo,caption=""){

await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
chat_id:chatId,
photo:photo,
caption:caption
})
})

}

export default async function handler(req,res){

const body=req.body;

if(!body.message){
return res.status(200).send("ok");
}

const chatId=body.message.chat.id;
const text=body.message.text;

users.add(chatId);

// START
if(text==="/start"){

const keyboard={
inline_keyboard:[
[{text:"📋 Copy Chat ID",callback_data:"copy"}],
[{text:"🤖 Bot Info",callback_data:"info"}]
]
}

await sendMessage(chatId,
`📌 <b>Your Chat ID</b>

<code>${chatId}</code>

Click and Copy your Chat ID easily.

⚡ Features
• Find Chat ID
• Easy Copy
• Fast Bot

Developer : SAHU`,keyboard)

}

// ADMIN PANEL
if(chatId===OWNER_ID && text==="/admin"){

await sendMessage(chatId,
`⚙️ <b>ADMIN PANEL</b>

📊 /users
📢 /broadcast text
🖼 /photo url
🎥 /video url`)

}

// USER COUNT
if(chatId===OWNER_ID && text==="/users"){

await sendMessage(chatId,
`👥 Total Users : ${users.size}`)

}

// TEXT BROADCAST
if(chatId===OWNER_ID && text.startsWith("/broadcast")){

let msg=text.replace("/broadcast ","")

let success=0

for(let id of users){

try{
await sendMessage(id,`📢 Broadcast

${msg}`)
success++
}catch{}

}

await sendMessage(chatId,
`✅ Broadcast Done

Sent : ${success}
Users : ${users.size}`)

}

// PHOTO BROADCAST
if(chatId===OWNER_ID && text.startsWith("/photo")){

let url=text.replace("/photo ","")

for(let id of users){

try{
await sendPhoto(id,url,"📢 Broadcast Photo")
}catch{}

}

await sendMessage(chatId,"✅ Photo Broadcast Sent")

}

res.status(200).send("ok")

}
