const nodemailer = require("nodemailer");
const nodemailerSendgrid = require("nodemailer-sendgrid");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    console.log("in email constructor");
    console.log("url: ", url);
    this.to = user.email;
    this.firstName = user.username.split(" ")[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    console.log(
      "logging env vars: ",
      process.env.EMAIL_HOST,
      process.env.EMAIL_PORT,
      process.env.SENDGRID_USERNAME,
      process.env.SENDGRID_PASSWORD
    );
    return nodemailer.createTransport(
      {
        service: "SendGrid",
        // host: process.env.EMAIL_HOST,
        // port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      }
      // nodemailerSendgrid({
      //   apiKey: process.env.SENDGRID_PASSWORD,
      // })
    );
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    console.log("in send");
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };
    console.log("sending email to sendgrid.");
    // 3) Create a transport and send email
    const resp = await this.newTransport().sendMail(mailOptions);
    console.log("resp after sending mail: ", resp);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }

  async sendPasswordReset() {
    console.log("email: sending password reset");
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
