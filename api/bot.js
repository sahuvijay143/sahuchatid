import fs from "fs";

const TOKEN = "8614503312:AAGq8QSpIdsP8gaAS1Q8TmYX69k4rG5FePg";
const OWNER_ID = 6941192709;

function getUsers() {
  return JSON.parse(fs.readFileSync("./users.json"));
}

function saveUsers(data) {
  fs.writeFileSync("./users.json", JSON.stringify(data, null, 2));
}

async function sendMessage(chatId, text, keyboard=null) {

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      chat_id:chatId,
      text:text,
      parse_mode:"HTML",
      reply_markup:keyboard
    })
  });

}

async function sendPhoto(chatId, photo, caption=""){

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      chat_id:chatId,
      photo:photo,
      caption:caption
    })
  });

}

export default async function handler(req,res){

const body=req.body;

if(body.message){

const chatId=body.message.chat.id;
const text=body.message.text;

let users=getUsers();

if(!users.includes(chatId)){
users.push(chatId);
saveUsers(users);
}

if(text==="/start"){

await sendMessage(chatId,
`👋 <b>Welcome to SAHU CHAT ID FIND</b>

📌 Your Chat ID
<code>${chatId}</code>

Use this ID anywhere.

⚡ Fast • Simple • Free`);

}

// ADMIN PANEL
if(chatId===OWNER_ID && text==="/admin"){

await sendMessage(chatId,
`⚙️ ADMIN PANEL

/users - total users
/broadcast - send message
/bphoto - photo broadcast`);

}

// USER COUNT
if(chatId===OWNER_ID && text==="/users"){

await sendMessage(chatId,
`👥 Total Users : ${users.length}`);

}

// TEXT BROADCAST
if(chatId===OWNER_ID && text.startsWith("/broadcast")){

let msg=text.replace("/broadcast ","");

let sent=0;

for(let id of users){

try{
await sendMessage(id,`📢 Broadcast

${msg}`);
sent++;
}catch{}

}

await sendMessage(chatId,
`✅ Broadcast Done

Sent : ${sent}
Users : ${users.length}`);

}

}

res.status(200).send("ok");

}
