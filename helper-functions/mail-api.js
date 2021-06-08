const nodemailer = require("nodemailer");
require('dotenv').config();

const sendMail = async (message, receiverEmail, subject) => {

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'gmail',
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    let info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: receiverEmail,
        subject: subject,
        text: message
    });

    console.log("Message sent: %s", info.messageId);
};

module.exports = {
    sendMail
};