import { Transporter, createTransport } from 'nodemailer';
import aws, { SES } from '@aws-sdk/client-ses';
import hbs from 'nodemailer-express-handlebars';


// verify env integrity
if (process.env.NODE_ENV === 'production') {
  if (!process.env.SES_ACCESS_KEY_ID || !process.env.SES_SECRET_ACCESS_KEY || !process.env.EMAIL_USER) {
    console.error('Missing SES_ACCESS_KEY_ID or SES_SECRET_ACCESS_KEY');
    process.exit(1);
  }
} else {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Missing EMAIL_USER or EMAIL_PASSWORD');
    process.exit(1);
  }
}

const ses =
  process.env.NODE_ENV === 'production'
    ? new SES({
        apiVersion: '2010-12-01',
        region: 'ap-southeast-1',
        credentials: {
          accessKeyId: process.env.SES_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.SES_SECRET_ACCESS_KEY as string,
        },
      })
    : null;

const transporterOptions =
  process.env.NODE_ENV === 'production'
    ? {
        SES: { ses, aws },
      }
    : {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER as string,
          pass: process.env.EMAIL_PASSWORD as string,
        },
      };

let transporter: Transporter;
try {
  transporter = createTransport(transporterOptions);
} catch (err) {
  console.error(err);
  process.exit(1);
}

const handlebarsOptions: hbs.NodemailerExpressHandlebarsOptions = {
  viewEngine: {
    partialsDir: process.cwd() + '/api/email_handler/templates',
    defaultLayout: false,
  },
  viewPath: process.cwd() + '/api/email_handler/templates',
  extName: '.html',
};

transporter.use('compile', hbs(handlebarsOptions));

export default transporter;

await transporter.sendMail({
  from: {
    name: 'hi',
    address: process.env.EMAIL_USER as string,
  }, // sender address
  to: ['sebastian.ong@hotmail.com'], // list of receivers
  subject: 'Hello ✔', // Subject line
  text: 'Hello world?', // plain text body
  html: '<b>Hello world?</b>', // html body
});
