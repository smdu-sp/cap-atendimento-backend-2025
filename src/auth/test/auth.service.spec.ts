import { UsuariosService } from "src/usuarios/usuarios.service";
import { UpdateUsuarioDto } from "src/usuarios/dto/update-usuario.dto";
import { Usuario } from "@prisma/client";
import { UsuarioPayload } from "../models/UsuarioPayload";
import { UsuarioJwt } from "../models/UsuarioJwt";
import { UsuarioToken } from "../models/UsuarioToken";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AppService } from "src/app.service";
import { AuthService } from "../auth.service";



describe('Auth.service Tests', () => {

    let service: AuthService;
    let prisma: PrismaService;

    const mockPrismaService = {
        auth: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn(),
            createMany: jest.fn(),
        },
    }

})