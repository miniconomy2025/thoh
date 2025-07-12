
import 'dotenv/config';
import BaseService from './base.service';
export class ExternalsService {
  baseService: BaseService;
  constructor() {
    this.baseService = new BaseService(
    );
  }
  async notifyRecyclers() {    
      const response = await this.baseService.post(`${process.env.RECYCLER_API_URL}/notify-me`);
      return response;
  }

  async notifyBulkLogistics(data:any) {
    const response = await this.baseService.post(`${process.env.BULK_LOGISTICS_API_URL}/truck/delivery`, data);
    return response;
  }

  async notifyConsumerLogistics(data:any) {
    const response = await this.baseService.post(`${process.env.CONSUMER_LOGISTICS_API_URL}/`, data);
    return response;
  }

  async notifyRecyclersMachineData(data:any) {
    const response = await this.baseService.post(`${process.env.RECYCLER_API_URL}`, data);
    return response;
  }
}
