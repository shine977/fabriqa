import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './shared/decorators/public.decorator';
import { unifyResponse } from './common/utils/unifyResponse';
import { generateBase64Key } from './common/utils/crypto';

@Controller('/crypto')
export class CryptoController {
  constructor(private readonly appService: AppService) {}

  @Get('/aesKey')
  @Public()
  getHello() {
    return unifyResponse(generateBase64Key());
  }
}
