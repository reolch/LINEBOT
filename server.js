'use strict';

const fs = require('fs');
const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
    channelSecret: '',
    channelAccessToken: ''
};

const app = express();

app.get('/', (req, res) => res.send('Hello LINE BOT!(GET)'));

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);

    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  var replyText = ''
  var text = fs.readFileSync("./server.js", 'utf8')
  replyText = text;
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText
  });
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);
