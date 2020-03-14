import { Mail, MailStatus } from "../../controllers/mails/model";
import l from '../../../common/logger';

import * as lodash from 'lodash';

export abstract class AbstractMailClient {
    name: string;                   // name of the email client
    requiredEnvVars: string[];      // env var required for service to work
    available: boolean = true;      // check if a service is available on startup or not
    successRatio: number = 0;       // diff of success and unsuccesful calls made so far
    timeout: number = 2000;         // max time allowed for service to send email, 2000ms = 2s

    abstract async sendMail(mail: Mail): Promise<{ status: MailStatus, description: any }>;

    constructor(name: string, requiredEnvVars: string[]) {
        this.name = name;
        this.requiredEnvVars = requiredEnvVars;

        // warn in console if required service variables are not set
        this.requiredEnvVars.forEach(reqServiceVar => {
            if (!lodash.get(process.env, reqServiceVar)) {
                l.warn(`${reqServiceVar} not set on env, "${this.name}" service will not be available`);
                this.available = false;
            }
        })

    }
}