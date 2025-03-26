import { ApiProperty } from "@nestjs/swagger"
import { IsDate, IsString, Length, MaxLength, MinLength, minLength } from "class-validator"

export class CreateAgendamentoDto {
    @ApiProperty()
    @IsString()
    municipe: string
    @ApiProperty()
    @IsString()
    @MinLength(8)
    @MaxLength(11)
    rg?: string
    @ApiProperty()
    @IsString()
    @Length(11)
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
