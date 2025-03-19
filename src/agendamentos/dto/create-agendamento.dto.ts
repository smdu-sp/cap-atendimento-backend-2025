import { ApiProperty } from "@nestjs/swagger"
import { IsDate, IsString } from "class-validator"

export class CreateAgendamentoDto {
    @ApiProperty()
    @IsString()
    municipe: string
    @ApiProperty()
    @IsString()
    rg?: string
    @ApiProperty()
    @IsString()
    cpf?: string
    @ApiProperty()
    @IsString()
    tecnicoId: string
    @ApiProperty()
    @IsString()
    coordenadoriaId: string
    @ApiProperty()
    @IsString()
    motivoId: string
    @ApiProperty()
    @IsString()
    processo: string
    @ApiProperty()
    @IsDate()
    dataInicio: Date
    @ApiProperty()
    @IsDate()
    dataFim: Date
}
