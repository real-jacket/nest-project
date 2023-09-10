import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { randomUUID } from 'crypto';
import * as qrcode from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import { Headers } from '@nestjs/common';

interface QrCodeInfo {
  status:
    | 'noscan'
    | 'scan-wait-confirm'
    | 'scan-confirm'
    | 'scan-cancel'
    | 'expired';
  userInfo?: {
    userId: number;
  };
}

const map = new Map<string, QrCodeInfo>();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  private users = [
    { id: 1, username: 'ke', password: '111' },
    {
      id: 2,
      username: 'ke2',
      password: '222',
    },
  ];

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('login')
  async login(@Query('username') username, @Query('password') password) {
    const user = this.users.find((item) => item.username === username);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    if (user.password !== password) {
      throw new UnauthorizedException('密码错误');
    }

    const token = this.jwtService.sign({
      userId: user.id,
    });

    return {
      token,
    };
  }

  @Get('userInfo')
  async userInfo(@Headers('Authorization') auth: string) {
    try {
      const [, token] = auth.split(' ');
      console.log('token: ', token);
      const info = await this.jwtService.verify(token);

      const user = this.users.find((item) => item.id === info.userId);
      return user;
    } catch (error) {
      throw new UnauthorizedException('token 过期，请重新登录');
    }
  }

  @Get('qrcode/gegerate')
  async generate() {
    const uuid = randomUUID();

    const dataUrl = await qrcode.toDataURL(
      `http://192.168.123.244:3000/pages/confirm.html?id=${uuid}`,
    );

    map.set(`qrcode_${uuid}`, {
      status: 'noscan',
    });

    return {
      qrcode_id: uuid,
      img: dataUrl,
    };
  }

  @Get('qrcode/check')
  async check(@Query('id') id: string) {
    const info = map.get(`qrcode_${id}`);

    if (!info) {
      throw new BadRequestException('二维码已过期');
    }

    if (info.status === 'scan-confirm') {
      return {
        token: await this.jwtService.sign({
          userId: info.userInfo.userId,
        }),
        ...info,
      };
    }

    return info;
  }

  @Get('qrcode/scan')
  async scan(@Query('id') id: string) {
    const info = map.get(`qrcode_${id}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }

    info.status = 'scan-wait-confirm';
    return 'success';
  }

  @Get('qrcode/confirm')
  async confirm(
    @Query('id') id: string,
    @Headers('Authorization') auth: string,
  ) {
    let user;

    try {
      const [, token] = auth.split(' ');
      const info = await this.jwtService.verify(token);
      console.log('info: ', info);

      user = this.users.find((item) => item.id === info.userId);
    } catch (error) {
      throw new UnauthorizedException('token 过期，请重新登录');
    }

    const info = map.get(`qrcode_${id}`);
    if (!info) {
      throw new BadRequestException('二维码已经过期');
    }

    info.status = 'scan-confirm';
    info.userInfo = user;
    return 'success';
  }

  @Get('qrcode/cancel')
  async cancel(@Query('id') id: string) {
    const info = map.get(`qrcode_${id}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }

    info.status = 'scan-cancel';
    return 'success';
  }
}
