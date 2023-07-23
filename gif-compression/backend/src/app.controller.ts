import {
  BadRequestException,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { Response } from 'express';
import * as sharp from 'sharp';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('file: ', file);

    return file.path;
  }

  @Get('compress')
  async compression(
    @Query('path') filePath: string,
    @Query('color', ParseIntPipe) color: number,
    @Query('level', ParseIntPipe) level: number,
    @Res() res: Response,
  ) {
    if (!existsSync(filePath)) {
      throw new BadRequestException('文件不存在');
    }

    const data = await sharp(filePath)
      .png({
        compressionLevel: level,
        force: true,
        palette: true,
      })
      .toBuffer();

    res.set('Content-Disposition', `attachment; filename="dest.png"`);

    res.send(data);
  }
}
