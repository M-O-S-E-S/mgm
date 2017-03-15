var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
import Promise = require('bluebird');

export class EmailMgr {
  private static _instance: EmailMgr = null;
  private transporter: any
  private source: string
  private admins: string[]
  private gridName: string
  private uri: string

  constructor(mailConfig: any) {
    if (EmailMgr._instance) {
      throw new Error('MailMgr singleton has already been initialized');
    }
    this.transporter = nodemailer.createTransport(smtpTransport(mailConfig.transport));
    this.source = mailConfig.sourceAccount;
    this.admins = mailConfig.admins;
    this.gridName = mailConfig.gridName;
    this.uri = mailConfig.loginURI;

    EmailMgr._instance = this;
  }

  public static instance(): EmailMgr {
    return EmailMgr._instance;
  }

  private sendMail(destination: string, subject: string, body: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let mailOptions = {
        from: this.source,
        to: destination,
        subject: subject,
        html: body
      };
      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err)
          return reject(err);
        resolve();
      });
    });
  }

  sendTestEmail(destination: string): Promise<void> {
    return this.sendMail(destination, 'MGM test email', 'This is a test email from your MGM instance for ' + this.gridName);
  }

  accountApproved(name: string, email: string): Promise<void> {
    return this.sendMail(email,
      this.gridName + ' Account Approved',
      'Congratulations ' + name + ', Your ' + this.gridName + ' account has been approved.<br><br> \
      Your account, and avatar, name is ' + name + '.<br><br> \
      You can now log into the ' + this.gridName + ' Grid using the name and password you registered with.<br> \
      You can connect using any Opensim compatible client.  We recommend the firestorm viewer <a href="http://www.firestormviewer.org/downloads/">http://www.firestormviewer.org/downloads/</a> \
      If you are on a different platform, or wish to use another viewer, the login uri for the MOSES Grid is: \
      ' + this.uri + ' <br><br> \
      We look forward to seeing you in world'
    );
  }

  registrationSuccessfull(name: string, email: string): Promise<void> {
    return this.sendMail(email,
      this.gridName + ' Application Received',
      name + ':<br>Thank you for registering for a ' + this.gridName + ' account.  If you are approved you will recieve an addtional email from us notifying you of how to connect to this grid.'
    );
  }

  notifyAdminUserPending(name: string, email: string): Promise<void[]> {
    let pending: Promise<void>[] = this.admins.map( (adminEmail) => {
      return this.sendMail(adminEmail,
        this.gridName + ' Application Received',
        this.gridName + ' Admin:<br>A new user account application has been receieved with the name ' + name + ' and the email ' + email + '.<br>Please review the applicant in the pending users tab in your MGM instance.'
      );
    })
    return Promise.all(pending);
  }

  accountDenied(email:string, reason:string): Promise<void> {
    return this.sendMail(email,
      this.gridName + ' Application Denied',
      'Your account application for MOSES has been denied.  The administrators of this MOSES instance have sent you the message:<br>' + reason + '<br> \
      <br>This is not a permanent injunction, and you are invited to seek to rectify the cause of your denial.'
    );
  }

  sendAuthResetToken(email: string, token: string): Promise<void> {
    return this.sendMail(email,
      this.gridName + ' Password Recovery',
      'Your password reset request has been processed.  Please visit ' + this.uri + '/password, and using the forgot password button, complete the second form using the following token:<br><br>' + token
    );
  }

  sendSaveOarComplete(email: string, description: string): Promise<void> {
    return this.sendMail(email,
      this.gridName + ' save oar complete',
      'Your save oar task has completed successfully.  Please download your file ' + description + ' from your user task list'
    );
  }

}
