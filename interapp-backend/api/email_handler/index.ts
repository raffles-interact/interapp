import { Transporter, createTransport } from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';


let transporter: Transporter;
try{
  transporter = createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASSWORD as string,
    },
  });
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

/*
await transporter.sendMail({
  from: {
    name: 'hi',
    address: process.env.EMAIL_USER as string,
  }, // sender address
  to: ['sebastian.ong@hotmail.com'], // list of receivers
  subject: "Hello ✔", // Subject line
  text: "Hello world?", // plain text body
  html: "<b>Hello world?</b>", // html body
});
*/
