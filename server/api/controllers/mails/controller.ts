import MailService from '../../services/mail.service';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as HttpStatus from 'http-status-codes';
import l from '../../../common/logger';

import { Mail } from './model';

export class Controller {
  async sendMail(req: Request, res: Response): Promise<any> {

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

    // we will perform the actual logic in the service
    try {
      const response = await MailService.sendMail(new Mail(req.body));
      return res
        .status(HttpStatus.OK)
        .json({
          status: HttpStatus.getStatusText(HttpStatus.OK),
          payload: response
        });

    } catch (error) {

      l.error(error);
      let errorMessage = 'Uknown exception';

      // this logic can be improved by custom error classes
      switch (error.message){
        case 'NO_EMAIL_CONFIGURED':
          errorMessage = 'No Email Client has been configured.';
          break;
        default:
      }
          

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({
          status: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR),
          error: { message:  errorMessage}
        });
    }

  }
}
export default new Controller();
