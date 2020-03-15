# email-integration-service

## Motivation
This mail-integration service is as a RESTful HTTP API that can perform the duty as an integration service to send emails. It can be an abstraction over an unlimited number of Email Clients that **can** be used to send emails. This provides resiliance in case one email client goes down. Currently, only two email clients are supported.

## API Documentation (Swagger) [Available Here](https://github.com/samiurrehman92/email-integration-service/blob/master/server/common/api.yml)

---
## Salient Featuers
* **Failover**: In case an email client **A** gives an error and the client **B** was succesful in sending the email. The service will remember the last client that sent a succesful email so next request will first try client **B** to send email (allowing more time for client A to recover).
* **Intelligent**: In the event the call to the last active email client was not succesful anymore, when deciding about which email clients to try next, the service will pick the email client that has been most succesful in previous attempts to send email. This is achieved by keeping the `successRatio` of every client in-memory.
* **Maintainability**: It is really easy to add more email clients. Please see the **Contribute** section below.
* **Timeout**: By default, request to each service will timeout in 1s. However, this can be overriden in client definition.
> NOTE: Failover & Intelligence is only im-memory so if service is restarted, this it will not remember either.

---
# Supported Mailing Clients

## 1. [SendGrid](https://sendgrid.com/docs/API_Reference/Web_API_v3/index.html)
SendGrid integration requires two environment variables to be able to run. These include:
#### 1. SEND_GRID_ENDPOINT
* This is a required Env Variable.
* This is the endpoint of SendGrid Service and can be normally set to "https://api.sendgrid.com" by default (according to their API).
#### 2. SEND_GRID_AUTH
* This is a required Env Variable.
* This is the authentication string that can be retrieved after signing up for SendGrid API.

## 2. [MailGun](https://documentation.mailgun.com/en/latest/api-sending.html)
MailGun integration requires two environment variables to be able to run. These include:
#### 1. MAIL_GUN_ENDPOINT
* This is a required Env Variable.
* This is the endpoint of MailGun Service and can be normally set to "https://api.mailgun.net" by default (according to their API).
#### 2. MAIL_GUN_AUTH
* This is a required Env Variable.
* This is the authentication string that can be retrieved after signing up for MailGun API.
#### 3. MAIL_GUN_SANDBOX
* This is a required Env Variable.
* This is the sandbox domain retrieved after signing up for MailGun API.

>Note: MailGun currently does not allow sending emails to any other email account other than the user who signed up. This can be improved in future.
---

## How to add a new mail client
1. Create a new file in `server/api/email-clients` with the name of your client.
2. Add any Env variables needed by your service to `.env` and `.env_SAMPLE` file.
3. Start with the following skeleton code and insert your own code where indicated: 
```
import { Mail, MailStatus } from "../../api/controllers/mails/model";
import { AbstractMailClient } from "../controllers/mails/mail-client.abstract";

const REQ_ENV_VARS: string[] = [<<INSERT_HERE>>]; // Add Env Variables needed by your service to run.

export class YourEmailClient extends AbstractMailClient {

    constructor() {
        super('<<INSERT_HERE>>', REQ_ENV_VARS); // Name your service
    }

    async sendMail(mail: Mail): Promise<{ status: string, description: any }> {
        <<INSERT_HERE>> // implement service logic here and return MailStatus that applies
    };
}
```
---

## Quick Start

Get started developing...

```shell
# install deps
npm install

# run in development mode
npm run dev

# run tests
npm run test
```

---

## Install Dependencies

Install all package dependencies (one time operation)

```shell
npm install
```

## Run It
#### Run in *development* mode:
Runs the application is development mode. Should not be used in production

```shell
npm run dev
```

or debug it

```shell
npm run dev:debug
```

#### Run in *production* mode:

Compiles the application and starts it in production production mode.

```shell
npm run compile
npm start
```

## Test It

Run the Mocha unit tests

```shell
npm test
```

or debug them

```shell
npm run test:debug
```

## Try It
* Open you're browser to [http://localhost:3000](http://localhost:3000)
* Invoke the POST `/v1/mails` endpoint 
```shell
curl --location --request POST 'localhost:3000/v1/mails' \
--header 'Content-Type: application/json' \
--data-raw '{
	"to" : [
		{	"email": "samiurrehman92@gmail.com"}
	],
	"cc" : [
		{
			"name" : "name",
			"email" : "deej.sami@gmail.com"
		}
	],
	"text": "this is email body",
	"subject": "this is an email from MailGun",
	"from": {
		"name": "Sender Name",
		"email": "test@mail.com"
	}
}'
```


## Debug It

#### Debug the server:

```
npm run dev:debug
```

#### Debug Tests

```
npm run test:debug
```

### Deploy
* We have deployed this solution on AWS Lambda using AWS serverless.
* Before doing any deployment, please ensure your have aws cli downloaded and isntalled. Read more here: `https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html`
* Please ensure you have appropriate access (or root access) account in AWS.
* Please ensure you set up a different `.env.prod` file for production environment seperately.
* Run `npm run serverless:deploy` in root folder to deploy the solution as a lambda and view the console to see the deployed URL.
* Latest version of the service is deployed at the following URL: `https://ruxsug82hg.execute-api.eu-central-1.amazonaws.com/dev/` and following endpoints are available:
GET - `https://ruxsug82hg.execute-api.eu-central-1.amazonaws.com/dev/` (just a welcome page)
GET - `https://ruxsug82hg.execute-api.eu-central-1.amazonaws.com/dev/api-explorer/index.html` (api docs ui)
GET - `https://ruxsug82hg.execute-api.eu-central-1.amazonaws.com/dev/v1/spec` (api docs swagger)
POST - `https://ruxsug82hg.execute-api.eu-central-1.amazonaws.com/dev/v1/mails` (endpoint to send emails)

---
# Future Enhancements
* We can use a database to store every request sent to the service and its result (my preference: MongoDB). This will also allow us to remember `successRatio` and `lastActiveServiceName` even if service goes down.
* We can use an SQS behind this service (and use SQS in the service to poll for data) to allow scalability and prevent loss of data when service is down.
* In case all clients in the service are failing to process the email request, we could trigger an alarm to inform the admin (in addition to sending error response) (my preference: SNS).
* Error handling could be improved further with more time, some additional cases that can be treated:
1. Request Body Size Validation.
2. Improve the error handling recieved from clients.
* Improve test coverage. Currently, only some tests are written to demostrate ability to write test.
* Improve the size of the build (node_modules) etc.
* Add support for MailGun to send email to any email address (currently it doesn't allow this for free accounts).
* I have used .ENV file also for variables that could be extracted into a config file due to lack of time.
