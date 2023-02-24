const axios = require("axios");
const {google} = require("googleapis");
const {generateConfig} = require("./utils");
require("dotenv").config();

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN});

async function readMail(req, res) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${process.env.EMAIL}/messages/${req.params.messageId}`;
        const {token} = await oAuth2Client.getAccessToken();
        const config = generateConfig(url, token);
        const response = await axios(config);
        let data = await response.data;
        res.json(data);
    } catch (error) {
        res.send(error);
    }
}

async function getList(req, res) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/messages?fields=messages.id`;
        const {token} = await oAuth2Client.getAccessToken();
        const config = generateConfig(url, token);
        const response = await axios(config);
        let data = await response.data.messages;
        res.json(data);
    } catch (error) {
        res.send(error);
    }
}

module.exports = {
    readMail,
    getList,
};