import { Application } from 'express';
import mailsRouter from './api/controllers/mails/router';
export default function routes(app: Application): void {
  app.use('/v1/mails', mailsRouter);
}
