/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';



@Controller('me')
export class ProtectedController {
  @UseGuards(AuthGuard('jwt'))
  @Get()
  profile(@Request() req: any) {
    return { ok: true, user: req.user };
  }
}
