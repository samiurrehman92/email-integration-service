import * as path from 'path';
import express, { Application } from 'express';
import errorHandler from '../api/middlewares/error.handler';
import { OpenApiValidator } from 'express-openapi-validator';

export default function (app: Application, routes: (app: Application) => void): Promise<void> {
  const apiSpec = path.join(__dirname, 'api.yml');
  const validateResponses = !!(
    process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION &&
    process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION.toLowerCase() === 'true'
  );
  return new OpenApiValidator({
    apiSpec,
    validateRequests : false,
    validateResponses,
  })
    .install(app)
    .then(() => {
      app.use('/v1/spec', express.static(apiSpec));
      routes(app);
      app.use(errorHandler);
    })
    .catch((err) => {
      console.error(err);
    });
};
