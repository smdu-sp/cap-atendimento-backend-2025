import { ApiProperty } from "@nestjs/swagger"
import { Permissao } from "@prisma/client"

export class EuResponseDTO {
    @ApiProperty()
    id: string
    @ApiProperty()
    nome: string
    @ApiProperty()
    nomeSocial?: string
    @ApiProperty()
    login: string
    @ApiProperty()
    email: string
    @ApiProperty()
    status: boolean
    @ApiProperty()
    ultimoLogin: Date
    @ApiProperty()
    criadoEm: Date
    @ApiProperty()
    atualizadoEm: Date
    @ApiProperty()
    avatar?: string;
    @ApiProperty()
    permissao: Permissao
}
