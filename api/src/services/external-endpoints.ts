
import 'dotenv/config';
import BaseService from './base.service';
export class ExternalsService {
  baseService: BaseService;
  constructor() {
    this.baseService = new BaseService(
    );
  }
  async notifyRecyclers() {    
      const response = await this.baseService.post(`${process.env.RECYCLER_API_URL}`);
      return response;
  }
}
