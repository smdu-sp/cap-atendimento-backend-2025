import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";

export class CreateCoordenadoriaDto {
    @ApiProperty()
    @IsString()
    sigla: string
    @ApiProperty()
    @IsBoolean()
    status?: boolean
}
