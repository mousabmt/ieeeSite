`use strict`
const express = require(`express`);
const cors = require(`cors`);
const app = express();
const pg = require('pg')
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const client = new pg.Client('postgresql://mousab:1234@localhost:5432/ieeeteam')
app.use(cors());
app.use(express.json());
const stamper = require('./middleware/stamper')
const notFoundHandler = require('./middleware/404')
const errorHandler = require('./middleware/500');

app.get('/', stamper, homeHandler);
app.get('/all', getMembers);
app.get('/records',getRecords);
app.post('/mail', sendEmailHandler)
app.post('/add', addNewMember);
app.delete('/delete/:id', deleteUsers);
app.put(`/update/:id`, updateUser);
app.use('*', notFoundHandler);
app.use(errorHandler)

function homeHandler(req, res) {
    try {

        res.status(200).json({
            code: 200,
            message: `Welcome To Home!`,
            Date: req.stamper.date,
            Time: req.stamper.time
        })

    } catch (error) {
        errorHandler(error, req, res)
    }
}
function getMembers(req, res) {
    const sql = `select * from users`;
    client.query(sql).then((data) => {
        res.json({
            data: data.rows
        })
    })
}
function getRecords(req, res) {
    const sql = `select * from emailRecords`;
    client.query(sql).then((data) => {
        res.json({
            data: data.rows
        })
    })
}
function addNewMember(req, res) {
    try {
        const member = req.body;

        const sql = `insert into users(user_name,user_pic,user_committee,user_email) values($1,$2,$3,$4) returning *`
        const handleUser = [
            member.user_name,
            member.user_pic,
            member.user_committee,
            member.user_email
        ]
        client.query(sql, handleUser).then((data) => {

            res.status(201).json({
                data: data.rows[0]
            })
        })

    } catch (error) {
        errorHandler(error, req, res)
    }

}
function deleteUsers(req, res) {
    try {


        const userId = req.params.id
        const sql = `delete from users where user_ID=$1`
        const id = [userId]

        client.query(sql, id).then(() => { })
        res.status(204).json({
            message: `${userId} deleted succefully!`
        })
    } catch (error) {
        errorHandler(error, req, res)
    }
}
function updateUser(req, res) {
    try {
        const user = req.body;
        const id = req.params.id
        const sql = `UPDATE users SET user_name = $1, user_pic = $2, user_committee = $3 WHERE user_ID = $4;`
        const userInput = [
            user.user_name,
            user.user_pic,
            user.user_committee,
            id
        ]

        client.query(sql, userInput).then(() => {
            res.status(200).json({
                message: `${id} Updated Succefully!`
            })
        })
    } catch (error) {
        errorHandler(error, req, res)
    }
}
async function sendEmail(emailSubject, message, committee = "all") {
    try {
        let sql;
        let params = []
        const subject = emailSubject;
        const body = `
          <p>Dear Attendee,</p>
          <p>${message}</p>
          <a href="https://script.google.com/macros/s/AKfycbwmwUiIWseX-YCgroTkeS7mwuz6NVodHSIZj46-c01jyXHKYc49R_n5Nh-APZSXyUkrGQ/exec?response=yes&email={{email}}&name={{name}}">Yes, of course</a>
          <a href="https://script.google.com/macros/s/AKfycbwmwUiIWseX-YCgroTkeS7mwuz6NVodHSIZj46-c01jyXHKYc49R_n5Nh-APZSXyUkrGQ/exec?response=no&email={{email}}&name={{name}}">No, maybe next time</a>
        `;

        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use 'gmail' instead of 'mail.gmail.com'
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'mousabtamari0799@gmail.com', // Your email address
                pass: 'smae zhzv pirj xhhy' // Your email password or application-specific password
            }
        });
        if (committee === "all") {
            sql = `select user_email,user_name from users`
        }
        else {
            sql = `select user_name,user_email from users where user_committee=$1`
            params.push(committee)
        }
        const result = await client.query(sql, params);
        if (result.rows.length > 0) {
            await Promise.all(result.rows.map(async (user) => {
                await transporter.sendMail({
                    from: 'mousabtamari0799@gmail.com', // replace with your sender email
                    to: user.user_email, // Assuming the user object has an email property
                    subject: subject,
                    html: body, // replace with your message
                    // Other email options can go here
                });
            }));
            console.log('Emails sent successfully.');
        } else {
            console.log('No users found.');
        }

    } catch (error) {
        console.log(error);

    }
}
async function sendEmailHandler(req, res) {
    try {

        const email = req.body;
        await sendEmail(email.subject, email.message, email.committee)
        const sql = `insert into emailRecords (messageContent,messageDateTime,committee) values($1,$2,$3)`;
        const emailRecord = [
            email.message,    // Message content
            new Date(),       // Current date and time
            email.committee   // Committee
        ];
console.log(emailRecord);

        await client.query(sql, emailRecord);
        res
            .status(200)
            .json({
                message: `Email ${email.subject} sent succefully!`,
                messageTime: new Date()
            })
    } catch (error) {
        errorHandler(error, req, res)
    }
}
async function start(port) {
    try {
        await client.connect();
        app.listen(port, () => console.log(`up and running on port `, port));

    } catch (error) {
        errorHandler(error, req, res)

    }
}
module.exports = {
    app,
    start
}