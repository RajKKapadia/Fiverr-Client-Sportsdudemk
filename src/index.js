// external packages
const express = require('express');
require('dotenv').config();

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(express.urlencoded({
    extended: true
}));
webApp.use(express.json());

// Server Port
const PORT = process.env.PORT || 5000;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

const GS = require('../helper-functions/sheet-api');
const DF = require('../helper-functions/dialogflow-api');

// Webhook
webApp.post('/webhook', async (req, res) => {

    console.log('A request came.');
    console.log(`Intent name --> ${req.body.queryResult.intent.displayName}`);
    console.log(`Confidance --> ${req.body.queryResult.intentDetectionConfidence}`);

    let intentName = req.body.queryResult.intent.displayName;
    let response = '';
    // let confidance = req.body.queryResult.intentDetectionConfidence;

    response = await GS.getSimpleResponse(intentName);

    res.send({
        fulfillmentText: response
    });
});

const TelegramBot = require('node-telegram-bot-api');
const TELEGRAMTOKEN = process.env.TELEGRAM_API_KEY;
const telegramBot = new TelegramBot(TELEGRAMTOKEN, { polling: true });
const SENDER_ID = process.env.SENDER_ID;

webApp.post('/contact-replied', async (req, res) => {

    let messenger = req.body.messenger;
    let placeholders = messenger.placeholders;

    console.log('Contact replied.');
    console.log(`Message --> ${messenger.message}`);
    console.log(`Campaign --> ${messenger.campaign_instance}`);
    console.log(`Profile link --> ${placeholders.imported_profile_link}`);
    console.log(`Name -- > ${placeholders.name}`);
    console.log(`Phone --> ${placeholders.phone}`);
    console.log(`Email --> ${placeholders.email}`);

    let message = messenger.message;
    let campaign = messenger.campaign_instance;
    let profile_link = placeholders.imported_profile_link;
    let name =  placeholders.name;
    let phone = placeholders.phone;
    let email = placeholders.email;

    let intentData = await DF.detectIntent('hello', 'abcdefgh12345678', 'en-US');

    let intent_name = intentData.intent_name;
    let dialogflow_response = intentData.reply;

    let date = new Date();
    let timestamp = date.toLocaleString('en', { timeZone: 'UTC' })

    let row = {
        timestamp: timestamp,
        message: message,
        campaign: campaign,
        profile_link: profile_link,
        name: name,
        phone: phone,
        email: email,
        intent_name: intent_name,
        dialogflow_response: dialogflow_response
    };

    await GS.addContactRepliedRow(row);

    telegramBot.sendMessage(SENDER_ID, `A contact ${name}, has replied to the campaign ${campaign} with a message ${message}.`);
    
    res.sendStatus(200);
});

webApp.post('/message-sent', async (req, res) => {

    let messenger = req.body.messenger;
    let placeholders = messenger.placeholders;

    console.log('New message send.');
    console.log(`Message --> ${messenger.message}`);
    console.log(`Campaign --> ${messenger.campaign_instance}`);
    console.log(`Profile link --> ${placeholders.imported_profile_link}`);
    console.log(`Name -- > ${placeholders.name}`);
    console.log(`Phone --> ${placeholders.phone}`);
    console.log(`Email --> ${placeholders.email}`);

    let message = messenger.message;
    let campaign = messenger.campaign_instance;
    let profile_link = placeholders.imported_profile_link;
    let name =  placeholders.name;
    let phone = placeholders.phone;
    let email = placeholders.email;

    let date = new Date();
    let timestamp = date.toLocaleString('en', { timeZone: 'UTC' })

    let row = {
        timestamp: timestamp,
        message: message,
        campaign: campaign,
        profile_link: profile_link,
        name: name,
        phone: phone,
        email: email
    };

    await GS.addMessageSentRow(row);
    
    res.sendStatus(200);
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});
