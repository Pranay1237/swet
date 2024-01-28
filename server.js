const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const env = require('dotenv').config();
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

app.use(cors());

app.get('/', async (req, res) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'mpranay14200@gmail.com',
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        const mailOptions = {
            from: 'Pranay <mpranay14200@gmail.com>',
            to: 'mudhirajpranay30@gmail.com',
            subject: 'Hello from gmail using API',
            text: 'Hello from gmail email using API',
            html: '<h1>Hello from gmail email using API</h1>',
            attachments: [
                {
                    filename: 'image.jpg',
                    path: 'C:/Users/PRANAY/Downloads/captured_photo.jpg',
                },
            ],
        };

        const result = await transport.sendMail(mailOptions);
        console.log('Email sent...', result);
        res.send('Email sent successfully');
    } catch (error) {
        console.log(error.message);
        res.send('Error sending email');
    }
});

app.get('/del', (req, res) => {
    const imagePath = 'C:/Users/PRANAY/Downloads/captured_photo.jpg';

    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error(err);
            res.send('Error deleting image');
        } else {
            console.log('Image deleted successfully');
            res.send('Image deleted successfully');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
