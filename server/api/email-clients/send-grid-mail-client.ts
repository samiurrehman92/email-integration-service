/**
 * Description: This file includes the logic specific to SendGrid sending email.
 * Reference: https://sendgrid.com/docs/API_Reference/Web_API_v3/index.html
 */
import { Mail, MailStatus } from "../../api/controllers/mails/model";
import { AbstractMailClient } from "../controllers/mails/mail-client.abstract";
import l from '../../common/logger';

import fetch from 'node-fetch';

// this can be improved into a map rather than strings
const REQ_ENV_VARS: string[] = ['SEND_GRID_ENDPOINT', 'SEND_GRID_AUTH'];

export class SendGridMailClient extends AbstractMailClient {

    sendEmailRoute: string = `${process.env.SEND_GRID_ENDPOINT}/v3/mail/send`;

    constructor() {
        super('SendGrid', REQ_ENV_VARS);
    }

    async sendMail(mail: Mail): Promise<{ status: MailStatus, description: any }> {
        let responseMessage: any;
        try {
            const response = await this.makeRequest(mail);
            mail.status = Mail.STATUS.Sent;
        } catch (err) {
            l.error('SendGrid Error:', err);
            responseMessage = err.message;
            mail.status = Mail.STATUS.NotProcessed;
        }
        return {
            status: mail.status,
            description: responseMessage
        };
    };

    private async makeRequest(mail: Mail): Promise<any> {
        return new Promise((resolve, reject) => {

            const requestBody: any = {
                personalizations: [{
                    to: mail.to,
                    cc: mail.cc,
                    bcc: mail.bcc,
                    subject: mail.subject
                }],
                from: mail.from,
                reply_to: mail.from,
                content: [
                    {
                        type: "text/plain",
                        value: mail.text
                    }
                ]
            };

            l.debug('Sending request to Sendgrind:', this.sendEmailRoute);
            l.debug('Request payload', requestBody);

            fetch(this.sendEmailRoute, {
                method: 'post',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${process.env.SEND_GRID_AUTH}`,
                },
                timeout: this.timeout,
            })
                .then(this.handleResponse)
                .then((r: any) => resolve(r)) // the response is empty body anyway
                .catch((e: any) => reject(e));
        });
    }

    private handleResponse(res: any) {
        l.debug('Recieved response from SendGrid', res.status);

        switch(res.status){
            case 202:
                return;
            case 400: // bad request
            case 401: // unauthorized
            case 403: // forbidden
            case 413: // payload too large
            case 429: // too many requests
                return res.json()
                .then((err: any) => {
                    throw Error(`${res.statusText} - ${JSON.stringify(err['errors'])}`);
                })
            default:
                l.error('SendGrid returned an unexpected service response', res);
        }

    }
}