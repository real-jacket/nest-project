import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { generateRandomStr } from './utils';
import { UniqueCode } from './entities/UniqueCode';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UniqueCodeService {
  @InjectEntityManager()
  private entiManager: EntityManager;

  async generateCode() {
    const str = generateRandomStr(6);

    const uniqueCode = await this.entiManager.findOneBy(UniqueCode, {
      code: str,
    });

    if (!uniqueCode) {
      const code = new UniqueCode();
      code.code = str;
      code.status = 0;

      return await this.entiManager.insert(UniqueCode, code);
    } else {
      return this.generateCode();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async batchGenerateCode() {
    for (let i = 0; i < 10000; i++) {
      this.generateCode();
    }
  }
}
