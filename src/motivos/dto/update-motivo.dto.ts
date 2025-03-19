import { PartialType } from '@nestjs/swagger';
import { CreateMotivoDto } from './create-motivo.dto';

export class UpdateMotivoDto extends PartialType(CreateMotivoDto) {}
