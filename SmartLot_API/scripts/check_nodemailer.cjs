const { MailtrapClient } = require("mailtrap");

 require('dotenv').config();

const TOKEN =  process.env.NODEMAILER_TOKEN;

const client = new MailtrapClient({ token: TOKEN });

const sender = {
  email: "hello@demomailtrap.co",
  name: "Smartlot Company",
};
const recipients = [
  { email: "49123639@est.ort.edu.ar" },
];

client
  .send({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    text: "Congrats for sending test email with Mailtrap!",
    category: "Integration Test",
  })
  .then(console.log, console.error);
