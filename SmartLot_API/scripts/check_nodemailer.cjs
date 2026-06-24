const { MailtrapClient } = require("mailtrap");

const TOKEN = "fcf445c3c7602352f2df6c36390f314d";

const client = new MailtrapClient({ token: TOKEN });

const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
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
