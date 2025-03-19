import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsString } from "class-validator"

export class CreateMotivoDto {
    @ApiProperty()
    @IsString()
    texto: string
    @ApiProperty()
    @IsBoolean()
    status?: boolean
}
