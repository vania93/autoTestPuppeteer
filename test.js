const puppeteer = require('puppeteer');
const express = require("express");
const routes = require("./router");
const jsdom = require("jsdom");

const app = express();


(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    app.listen(process.env.PORT, () => {
        console.log("listening on port " + process.env.PORT);
    });
    app.use('/api', routes)
    const page = await browser.newPage();
    let response;
    await fetch('http://localhost:8000/api/mail/read/1863b64d375c37fb').then((response) => response.json())
        .then((data) => response = data);
    response = new Buffer.from(response, 'base64').toString('ascii');

    const domPage = new jsdom.JSDOM(response);
    let url = domPage.window.document.querySelector('center > p > a').getAttribute('href');

    await page.goto(url);
    await page.waitForSelector('.note.note-error a');
    await page.click('.note.note-error a');
    await page.waitForSelector('#login_form');
    await page.type('.login-form-div > div:nth-child(1) input', process.env.EMAIL);
    await page.type('.login-form-div > div:nth-child(2) input', process.env.PASSWORD);
    await page.click('#login_form .form-actions > button');
    await page.waitForSelector('.username .hidden-sm.hidden-xs');

    await browser.close();
    await process.exit(0);
})();