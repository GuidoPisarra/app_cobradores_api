/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Controller('inspection')
export class VehicleInspectionController {
  constructor(
    @Inject('VEHICLE_INSPECTION_SERVICE')
    private readonly inspectionClient: ClientProxy,
  ) { }

  @Post('inspeccionar')
  async inspeccionar(@Body() body: any) {
    let imagenBase64 = body?.imagenBase64;
    console.log('LARGO base64', imagenBase64.length);

    if (!imagenBase64) {
      throw new HttpException('imagenBase64 es requerida', HttpStatus.BAD_REQUEST);
    }

    // ✅ Si viene con el prefijo, lo recortamos automáticamente
    if (imagenBase64.startsWith('data:image')) {
      imagenBase64 = imagenBase64.split(',')[1];
    }
    console.log('Payload que estamos enviando:', { imagenBase64 });

    const result = await firstValueFrom(
      this.inspectionClient
        .send({ cmd: 'analizar_imagen' }, { imagenBase64 })
        .pipe(timeout(120000)),
    );

    return result;
  }
}
