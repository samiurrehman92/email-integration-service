import './common/env';

import serverless from "serverless-http";
import Server from './common/server';
import routes from './routes';

const app = new Server().router(routes).serverless();

module.exports.handler = serverless(app);