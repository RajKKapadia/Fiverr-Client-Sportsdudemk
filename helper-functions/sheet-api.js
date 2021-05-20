require('dotenv').config();

const { GoogleSpreadsheet } = require('google-spreadsheet');

// spreadsheet key is the long id in the sheets URL
const RESPONSES_SHEET_ID = process.env.RESPONSES_SHEET_ID;
const MESSAGES_SHEET_ID = process.env.MESSAGES_SHEET_ID;

const responseDoc = new GoogleSpreadsheet(RESPONSES_SHEET_ID);
const messageDoc = new GoogleSpreadsheet(MESSAGES_SHEET_ID);

// Credentials for the service account
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);

// Get simple responses for dialogflow
const getSimpleResponse = async (intentName) => {

    try {
        // use service account creds
        await responseDoc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });

        await responseDoc.loadInfo();

        let sheet = responseDoc.sheetsByIndex[0];

        let rows = await sheet.getRows();

        let response = '';

        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if (row.intentName == intentName) {
                response += row.textReply;
                break;
            }
        };

        if (response === '') {
            response += 'We are unavailable at this time. Try after sometimes.';
        }

        return response;
    } catch (error) {
        console.log(`Error at getSimpleResponse --> ${error}`);
        return 'We are unavailable at this time. Try after sometimes.';
    }
};

// Add new row in message sent
const addMessageSentRow = async (row) => {

    try {
        // use service account creds
        await messageDoc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });

        await messageDoc.loadInfo();

        // Index of the sheet
        let sheet = messageDoc.sheetsByIndex[1];

        await sheet.addRow(row);
    } catch (error) {
        console.log(`Error at addMessageSentRow --> ${error}`);
    }
};

// Add new row in contact replied
const addContactRepliedRow = async (row) => {

    try {
        // use service account creds
        await messageDoc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });

        await messageDoc.loadInfo();

        // Index of the sheet
        let sheet = messageDoc.sheetsByIndex[0];

        await sheet.addRow(row);
    } catch (error) {
        console.log(`Error at addMessageSentRow --> ${error}`);
    }
};

module.exports = {
    getSimpleResponse,
    addMessageSentRow,
    addContactRepliedRow
};
