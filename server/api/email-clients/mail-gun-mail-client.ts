/**
 * Description: This file includes the logic specific to MailGun sending email.
 * Reference: https://documentation.mailgun.com/en/latest/api-sending.html
 */

import { Mail, MailStatus } from "../../api/controllers/mails/model";
import { AbstractMailClient } from "../controllers/mails/mail-client.abstract";

import fetch from 'node-fetch';
import FormData from 'form-data';

const REQ_ENV_VARS: string[] = ['MAIL_GUN_ENDPOINT', 'MAIL_GUN_AUTH', 'MAIL_GUN_SANDBOX'];

export class MailGunMailClient extends AbstractMailClient {

    sendEmailRoute: string = `${process.env.MAIL_GUN_ENDPOINT}/v3/${process.env.MAIL_GUN_SANDBOX}/messages`;

    constructor() {
        super('MailGun', REQ_ENV_VARS);
    }

    async sendMail(mail: Mail): Promise<{ status: MailStatus, description: any }> {
        let responseMessage: any;
        try {
            const response = await this.makeRequest(mail);
            mail.status = Mail.STATUS.Queued;
            responseMessage = response;
        } catch (err) {
            console.error('MailGun Error:', err);
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

            let formData = new FormData();
            formData.append('to', mail.to.map(mail => `${mail.name} <${mail.email}>`).join(', '));
            formData.append('from', `${mail.from.name} <${mail.from.email}>`);

            formData.append('subject', mail.subject);
            formData.append('text', mail.text);
            if (mail.cc){
                formData.append('cc', mail.cc.map(mail => `${mail.name} <${mail.email}>`).join(', '));
            }
            if (mail.bcc){
                formData.append('bcc', mail.bcc.map(mail => `${mail.name} <${mail.email}>`).join(', '));
            }

            console.debug('Sending request to Sendgrind:', this.sendEmailRoute);
            console.debug('Request payload', JSON.stringify(formData));

            fetch(this.sendEmailRoute, {
                method: 'post',
                body: formData,
                headers: { 'authorization': `Basic ${process.env.MAIL_GUN_AUTH}`, },
                timeout: this.timeout,
            })
                .then(this.handleResponse)
                .then((res: any) => resolve(res))
                .catch((e: any) => reject(e));
        });
    }

    private handleResponse(res: any) {
        console.debug('Recieved response from MailGun', res.status);

        switch (res.status) {
            case 200:
                return res.json();
            case 400: // bad request
            case 401: // unauthorized
            case 402: // Request Failed - Parameters were valid but request failed
            case 413: // payload too large
                return res.json()
                    .then((err: any) => {
                        throw Error(`${res.statusText} - ${JSON.stringify(err['message'])}`);
                    })
            default:
                console.error('MailGun returned an unexpected service response', res);
        }

    }
}