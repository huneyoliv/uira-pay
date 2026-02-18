import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Health Check' })
  @Header('Content-Type', 'text/html')
  getHello(): string {
    return '<html><head><title>Uirá Pay</title></head><body>OK</body></html>';
  }
}
