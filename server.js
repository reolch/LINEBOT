'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const puppeteer = require('puppeteer');
const PORT = process.env.PORT || 3000;

const config = {
    channelSecret: process.env.LB_CHANNEL_STOKEN,
    channelAccessToken: process.env.LB_CHANNEL_ATOKEN
};

const app = express();

// app.get('/', (req, res) => res.send('Hello LINE BOT!(GET)')); //ブラウザ確認用(無くても問題ない)
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
   
    var replyText = '';
  // var text = fs.readFileSync("./server.js", 'utf8');
    var text = await scTest();
  //   var lines = text.toString().split('\n');
    replyText = text;
  
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText //実際に返信の言葉を入れる箇所
    });
}

async function scTest() {
    const options = {
        ////////////// 読み込みの高速化を図るためのオプション ////////////
        // headless: false,                                         //
        // slowMo: 100,                                             //
        //////////////////////////////////////////////////////////////
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--single-process'
        ]
    };
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    // js、cssの読み込みをなくして高速化
    await page.setRequestInterception(true);
    page.on('request', (request) => {
    if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
        request.abort();
    } else {
        request.continue();
    }
    });
    
    await page.goto('https://math.cs.kitami-it.ac.jp/~kouno/sotuken/04/maeda/mathml.html');
    const xpath = '/html/body/h2[1]';
    await page.waitForXPath(xpath);
    const elems = await page.$x(xpath);
    console.log(elems);
    const jsHandle = await elems[0].getProperty('textContent');
    const text = await jsHandle.jsonValue();
    console.log(text);
  //   await page.screenshot({path: 'example.png'});
  
    await browser.close();
    return text;
  };

app.listen(PORT);
console.log(`Server running at ${PORT}`);