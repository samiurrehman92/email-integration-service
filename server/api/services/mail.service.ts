import L from '../../common/logger'
import { Mail, MailStatus } from '../controllers/mails/model';

import { AbstractMailClient } from '../controllers/mails/mail-client.abstract';
import { SendGridMailClient } from '../email-clients/send-grid-mail-client';

export class MailService {
  mailClients: Array<AbstractMailClient>;
  lastActiveClientName: string;

  constructor() {
    this.mailClients = [
      new SendGridMailClient(),      
    ];
  }

  async sendMail(mail: Mail): Promise<{ status: string, description: any }> {
    L.info('Email request recieved', mail);

    let clientResults: any[] = [];
    let finalStatus: MailStatus;

    const smartClients = this.mailClients
      .filter(client => client.available)
      .sort((a, b) => { // sort the last active client first, then based on successRatio
        if (a.name == this.lastActiveClientName) {
          return -1;
        } else if (b.name == this.lastActiveClientName) {
          return 1;
        } else {
          a.successRatio - b.successRatio;
        }
      });

    L.info('Clients to be used', smartClients);
    if (!smartClients.length) {
      throw Error('NO_EMAIL_CONFIGURED');
    }

    for (let client of smartClients) {
      const response: { status: MailStatus, description: string } = await client.sendMail(mail);

      finalStatus = response.status;
      clientResults.push({
        name: client.name,
        status: Mail.STATUS[finalStatus],
        description: response.description
      });

      if (finalStatus === MailStatus.NotProcessed) {
        client.successRatio--; // if client failed to send, reduce the sendRatio
      } else {
        // if client sending did not fail, increase sendRatio, update lastActiveClientName and break loop
        client.successRatio++;
        this.lastActiveClientName = client.name;
        break;
      }
    }

    return Promise.resolve({
      status: Mail.STATUS[finalStatus],
      description: clientResults
    });
  }
}

export default new MailService();