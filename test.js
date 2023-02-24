const puppeteer = require('puppeteer');
const express = require("express");
const routes = require("./router");
const jsdom = require("jsdom");
const {faker} = require("@faker-js/faker");

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

    let listEmail;
    await fetch('http://localhost:8000/api/mail/messages/' + process.env.EMAIL).then((response) => response.json())
        .then((data) => listEmail = data);
    let emailCount = listEmail.length

    const page = await browser.newPage();
    await page.goto('https://app.nuacom.ie/login/');
    await page.waitForSelector('.login-options.text-center.login-form-div > a');
    await page.click('.login-options.text-center.login-form-div > a');
    await page.type('#reset_pass_form .form-control.placeholder-no-fix', process.env.EMAIL);
    await page.click('#reset_form_submit');

    let newEmailCount = emailCount
    while (newEmailCount === emailCount) {
        await fetch('http://localhost:8000/api/mail/messages/' + process.env.EMAIL).then((response) => response.json())
            .then((data) => listEmail = data);
        newEmailCount = listEmail.length;
        await page.waitForTimeout(5000);
    }

    let response = [];

    for (let i = 0; i < listEmail.length; i++) {
        await fetch('http://localhost:8000/api/mail/read/' + listEmail[i].id).then((response) => response.json())
            .then((data) => {
                if (data.snippet.includes('We have received a request to reset the password associated with this email address')) {
                    response.push(data)
                }
            });
    }

    let lastMessage = response[0];

    response.forEach((element) => {
        if (lastMessage.internalDate < element.internalDate) {
            lastMessage = element
        }
    })

    lastMessage = new Buffer.from(lastMessage.payload.body.data, 'base64').toString('ascii');
    const domPage = new jsdom.JSDOM(lastMessage);
    let url = domPage.window.document.querySelector('tr > .mcnTextContent > p > a').getAttribute('href');

    await page.goto(url);
    await page.waitForSelector('[name="newpass"]');
    let password = faker.internet.password(20, false, /[A-Za-z0-9_!@#$%^&*()]/);
    await page.type('[name="newpass"]', password);
    await page.type('[name="confirmpass"]', password);
    await page.click('.btn.green.col-md-offset-4.btn-submit');
    await page.waitForSelector('.username .hidden-sm.hidden-xs');

    await browser.close();
    await process.exit(0);
})();