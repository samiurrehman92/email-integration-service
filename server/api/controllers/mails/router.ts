import express from 'express';
import { checkSchema } from 'express-validator';

import controller from './controller'
import { mailSchemaValidation } from './model';

export default express.Router()
    .post('/', checkSchema(mailSchemaValidation), controller.sendMail)