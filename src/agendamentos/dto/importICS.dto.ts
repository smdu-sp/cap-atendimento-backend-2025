import { ApiProperty } from '@nestjs/swagger';

export class ImportICSDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  arquivo: any;
}