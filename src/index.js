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

// Contact Replied event from Expandi
webApp.post('/contact-replied', async (req, res) => {

    let messenger = req.body.messenger;
    let placeholders = messenger.placeholders;

    console.log('Contact replied.');
    console.log(`Hook name --> ${req.body.hook.name}`);
    console.log(`Message --> ${messenger.message}`);
    console.log(`Campaign --> ${messenger.campaign_instance}`);
    console.log(`Profile link --> ${placeholders.imported_profile_link}`);
    console.log(`First name -- > ${placeholders.first_name}`);
    console.log(`Last name -- > ${placeholders.last_name}`);
    console.log(`Phone --> ${placeholders.phone}`);
    console.log(`Email --> ${placeholders.email}`);

    let profile = req.body.hook.name;
    let message = messenger.message;
    let campaign = messenger.campaign_instance;
    let profile_link = placeholders.imported_profile_link;
    let first_name = placeholders.first_name;
    let last_name = placeholders.last_name;
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
        profile: profile,
        campaign: campaign,
        profile_link: profile_link,
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        email: email,
        intent_name: intent_name,
        dialogflow_response: dialogflow_response
    };

    await GS.addContactRepliedRow(row);

    telegramBot.sendMessage(SENDER_ID, `A contact ${first_name} ${last_name}, has replied to the campaign ${campaign} on profile ${profile} has sent a message.`);

    res.sendStatus(200);
});

// Message sent event from Expandi
webApp.post('/message-sent', async (req, res) => {

    let messenger = req.body.messenger;
    let placeholders = messenger.placeholders;

    console.log('New message send.');
    console.log(`Hook name --> ${req.body.hook.name}`);
    console.log(`Message --> ${messenger.message}`);
    console.log(`Campaign --> ${messenger.campaign_instance}`);
    console.log(`Profile link --> ${placeholders.imported_profile_link}`);
    console.log(`First name -- > ${placeholders.first_name}`);
    console.log(`Last name -- > ${placeholders.last_name}`);
    console.log(`Phone --> ${placeholders.phone}`);
    console.log(`Email --> ${placeholders.email}`);

    let profile = req.body.hook.name;
    let message = messenger.message;
    let campaign = messenger.campaign_instance;
    let profile_link = placeholders.imported_profile_link;
    let first_name = placeholders.first_name;
    let last_name = placeholders.last_name;
    let phone = placeholders.phone;
    let email = placeholders.email;

    let date = new Date();
    let timestamp = date.toLocaleString('en', { timeZone: 'UTC' })

    let row = {
        timestamp: timestamp,
        message: message,
        profile: profile,
        campaign: campaign,
        profile_link: profile_link,
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        email: email
    };

    await GS.addMessageSentRow(row);

    res.sendStatus(200);
});

// Contact Tagged event Expandi
webApp.post('/contact-tagged', async (req, res) => {

    // get the configuration
    console.log(`Company name --> ${req.query.company_name}`);
    let company_name = req.query.company_name;
    let configurationData = await GS.getConfiguration(company_name);

    if (configurationData.status == 1) {

        let hook = req.body.hook;
        let dateobj = new Date(hook.fired_datetime);
        function pad(n) { return n < 10 ? "0" + n : n; }
        var date = pad(dateobj.getDate()) + "/" + pad(dateobj.getMonth() + 1) + "/" + dateobj.getFullYear();
        let profile = hook.name;

        let contact = req.body.contact;
        let type = contact.tags[0];
        let company = contact.company_name;

        let messenger = req.body.messenger;
        let campaign = messenger.campaign_instance;
        let last_received_message = messenger.last_received_message

        let placeholders = messenger.placeholders;
        let profile_link = placeholders.imported_profile_link;
        let first_name = placeholders.first_name;
        let last_name = placeholders.last_name;
        let phone = placeholders.phone;
        let email = placeholders.email;

        console.log(`Profile --> ${profile}`);
        console.log(`Date --> ${date}`);
        console.log(`Type --> ${type}`);
        console.log(`Company --> ${company}`);
        console.log(`Campaign --> ${campaign}`);
        console.log(`Last received message --> ${last_received_message}`);
        console.log(`Profile link --> ${placeholders.imported_profile_link}`);
        console.log(`First name -- > ${placeholders.first_name}`);
        console.log(`Last name -- > ${placeholders.last_name}`);
        console.log(`Phone --> ${placeholders.phone}`);
        console.log(`Email --> ${placeholders.email}`);

        let row = {
            'Campaign': campaign,
            'Profile': profile,
            'First Name': first_name,
            'Last Name': last_name,
            'Phone': phone,
            'Email': email,
            'Company': company,
            'Profile Link': profile_link,
            'All Messages': last_received_message,
            'Last Message': last_received_message,
            'Sum': 1,
            'Channel': 'LinkedIn',
            'Type': type,
            'Date': date,
        }

        if (type == 'Lead') {
            row['Total Qualified Leads'] = 1;
        } else {
            row['Total Appts'] = 1;
        }

        await GS.addNewRow(configurationData.configurationData, row);
    }

    res.sendStatus(200);
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});
