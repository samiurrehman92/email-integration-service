import MailService from '../../services/mail.service';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as HttpStatus from 'http-status-codes';
import { Mail } from './model';

export class Controller {
  sendMail(req: Request, res: Response): any {

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatus.UNPROCESSABLE_ENTITY)
        .json({
          status: HttpStatus.getStatusText(HttpStatus.UNPROCESSABLE_ENTITY),
          error: errors
            .array()
            .map(error => `${error['param']}: ${error['msg']}`)
        });
    }

    // we will perform logic here
    // const response = await MailService.sendMail(new Mail(req.body));
    return res
      .status(HttpStatus.OK)
      .json({
        status : HttpStatus.getStatusText(HttpStatus.OK),
        payload: {received: true}
      });
  }
}
export default new Controller();
