var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


export class EmailMgr {
  private static _instance: EmailMgr = null;
  private transporter: any

  constructor(mailServer: string) {
    if (EmailMgr._instance) {
      throw new Error('MailMgr singleton has already been initialized');
    }
    this.transporter = nodemailer.createTransport(smtpTransport({
      host: mailServer,
      port: 25,
      tls: {
        rejectUnauthorized: false
      }
    }));

    EmailMgr._instance = this;
  }

  public static instance(): EmailMgr {
    return EmailMgr._instance;
  }

  sendTestEmail(destination: string) {
    let mailOptions = {
      from: '"MGM@militarymetaverse.org"',
      to: destination,
      subject: 'MGM test email',
      text: 'This is a test email from MGM'
    };
    this.transporter.sendMail(mailOptions, (err, info) => {
      if (err)
        return console.log(err);
      console.log('Message sent: ' + info.response);
    });
  }

}
