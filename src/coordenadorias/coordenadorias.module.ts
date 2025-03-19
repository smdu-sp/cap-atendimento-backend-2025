import { Module } from '@nestjs/common';
import { CoordenadoriasService } from './coordenadorias.service';
import { CoordenadoriasController } from './coordenadorias.controller';

@Module({
  controllers: [CoordenadoriasController],
  providers: [CoordenadoriasService],
})
export class CoordenadoriasModule {}
