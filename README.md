# email-integration-service

## Motivation
This mail-integration service is as a RESTful HTTP API that can perform the duty as an integration service to send emails. It can be an abstraction over an unlimited number of Email Clients that **can** be used to send emails. This provides resiliance in case one email client goes down. Currently, only two email clients are supported.

## API Documentation (Swagger) [Available Here](https://github.com/samiurrehman92/email-integration-service/blob/master/docs/api.yml)

---
## Salient Featuers
* **Failover**: In case an email client **A** gives an error and the client **B** was succesful in sending the email. The service will remember the last client that sent a succesful email so next request will first try client **B** to send email (allowing more time for client A to recover).
* **Intelligent**: In the event the call to the last active email client was not succesful anymore, when deciding about which email clients to try next, the service will pick the email client that has been most succesful in previous attempts to send email. This is achieved by keeping the `successRatio` of every client in-memory.
* **Maintainability**: It is really easy to add more email clients. Please see the **Contribute** section below.
* **Timeout**: By default, request to each service will timeout in 1s. However, this can be overriden in client definition.
> NOTE: Failover & Intelligence is only im-memory so if service is restarted, this it will not remember either.




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

---
# Future Enhancements
* We can use a database to store every request sent to the service and its result (my preference: MongoDB). This will also allow us to remember `successRatio` and `lastActiveServiceName` even if service goes down.
* We can use an SQS behind this service (and use SQS in the service to poll for data) to allow scalability and prevent loss of data when service is down.
* In case all clients in the service are failing to process the email request, we could trigger an alarm to inform the admin (in addition to sending error response) (my preference: SNS).