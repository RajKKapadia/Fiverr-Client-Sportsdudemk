// Requiered Packages
const dialogflow = require('dialogflow').v2beta1;
require('dotenv').config();

// Your credentials
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);

// Your google dialogflow project-id
const projectId = CREDENTIALS.project_id;

// Configuration for the client
const config = {
    credentials: {
        private_key: CREDENTIALS['private_key'],
        client_email: CREDENTIALS['client_email']
    }
}

// Create a session client
const sessionClient = new dialogflow.SessionsClient(config);

const detectIntent = async (queryText, sessionId, languageCode) => {

    // Create a sessionPath for the senderId
    let sessionPath = sessionClient.sessionPath(projectId, sessionId);

    let request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: queryText,
                languageCode: languageCode,
            }
        }
    };

    try {
        let responses = await sessionClient.detectIntent(request);
        let result = responses[0].queryResult;
        return {
            status: 200,
            reply: result.fulfillmentMessages[0].text.text[0],
            intent_name: result.intent.displayName,
            confidence: result.intentDetectionConfidence
        }
    } catch (error) {
        console.log(`Error at detectIntent --> ${error}`);
        return {
            status: 401
        };
    }
};

module.exports = {
    detectIntent
}