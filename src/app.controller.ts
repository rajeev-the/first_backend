import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('General')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '🌐 [PUBLIC] API Root Status' })
  getHello(): { message: string } {
    return { message: this.appService.getHello() };
  }
}
