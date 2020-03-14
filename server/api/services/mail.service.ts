import L from '../../common/logger'
import { Mail, MailStatus } from '../controllers/mails/model';

export class MailService {
  sendMail(mail: Mail): Promise<{ status: MailStatus, description: string }> {
    L.info('Email request recieved', mail);
    
    return Promise.resolve({
      status: MailStatus.NotProcessed,
      description: 'done'
    });
  }
}

export default new MailService();