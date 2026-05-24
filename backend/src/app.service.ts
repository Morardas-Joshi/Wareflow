import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to FlowCore ERP API! The API is fully functional.';
  }
}
