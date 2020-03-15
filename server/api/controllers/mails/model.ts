import { ValidationSchema, ParamSchema } from "express-validator";
import { isArray } from 'lodash';

export enum MailStatus {
    Rejected = -1,
    NotProcessed = 0,
    Queued = 1,
    Sent = 2
}

class emailAddress {
    name: string;
    email: string;
}

export class Mail {
    to: emailAddress[];
    cc: emailAddress[];
    bcc: emailAddress[];
    from: emailAddress;
    subject: string;
    text: string;

    static STATUS = MailStatus;
    status: MailStatus;

    constructor(params: any = {}) {
        this.to = params['to'];
        this.cc = params['cc'];
        this.bcc = params['bcc'];
        this.from = params['from'];

        this.subject = params['subject'];
        this.text = params['text'];

        this.status = MailStatus.NotProcessed;
    }
};

// readmore: https://express-validator.github.io/docs/schema-validation.html
const emailAddressSchema: ParamSchema = {
    notEmpty: {
        errorMessage: 'Email is required'
    },
    isEmail: {
        errorMessage: 'Email should be a valid email address',
    }
};

const emailNameSchema: ParamSchema = {
    optional: true,
    isString: {
        errorMessage: 'Name should be a string',
    }
}

export const mailSchemaValidation: ValidationSchema = {
    text: {
        notEmpty: {
            errorMessage: 'Text is required.'
        },
        isString: {
            errorMessage: 'Text should be a string.'
        },
    },
    to: {
        isArray: {
            options: {
                min: 1,
                max: 1000
            },
        },
    },
    cc: {
        isArray: {
            options: {
                min: 0,
                max: 1000
            }
        },
    },
    bcc: {
        isArray: {
            options: {
                min: 0,
                max: 1000
            }
        },
    },
    subject: {
        notEmpty: {
            errorMessage: 'Subject is required.'
        }
    },
    from: {
        exists: {
            errorMessage: 'From is required.'
        }
    },
    'from.email': emailAddressSchema,
    'from.name': emailNameSchema,
    'service_names': {
        optional: true,
        isIn: {
            options: [[
                'MailGun',
                'SendGrid'
            ]],
            errorMessage: `Invalid service name, it should be one of following: [MailGun,SendGrid]`
        },
    }
};

['to', 'cc', 'bcc'].forEach(field => {
    mailSchemaValidation[`${field}.*.email`] = emailAddressSchema;
    mailSchemaValidation[`${field}.*.name`] = emailNameSchema;
    mailSchemaValidation[field] = {
        custom: {
            options(value) {
                if (value && !isArray(value)) throw new Error(`${field} should be an array.`);
                if (value && !value.length) throw new Error(`If used, ${field} should not be an empty array.`);
                return true;
            }
        }
    };
});