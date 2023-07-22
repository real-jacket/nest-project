import { Controller, Get, Post } from '@nestjs/common';
import { AaaService } from './aaa.service';

@Controller('aaa')
export class AaaController {
  constructor(private readonly aaaService: AaaService) {}

  @Get()
  get() {
    return 'aaa';
  }

  @Post()
  post() {
    return 'post aaa';
  }
}
