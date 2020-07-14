import nodemailer from 'nodemailer';

const sendMail = async (to, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  const mailOptions = {
    from: '"Stackoverflow" <noreply@stackoverflow.com>',
    to,
    subject,
    html: message,
  };
  const info = await transporter.sendMail(mailOptions);
  // eslint-disable-next-line no-console
  console.log('Email info: ', info.response);
};

export default sendMail;
