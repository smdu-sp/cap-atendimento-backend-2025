import { CreateCoordenadoriaDto } from "../dto/create-coordenadoria.dto";
import { UpdateCoordenadoriaDto } from "../dto/update-coordenadoria.dto";
import { Agendamento } from "@prisma/client";
import { Coordenadoria } from "@prisma/client";
import { CoordenadoriasService } from "../coordenadorias.service";
import { PrismaService } from "src/prisma/prisma.service";
import { AppService } from "src/app.service";
import { TestingModule, Test } from "@nestjs/testing";
import exp from "constants";

describe('Coordenadorias.service tests', () => {
    let service: CoordenadoriasService;
    let prisma: PrismaService;
    let app: AppService;

    const MockPrismaService = {
        coordenadoria: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn()
        }
    }

    const MockAppService = {
        verificaPagina: jest
            .fn()
            .mockImplementation((pagina, limite) => [pagina, limite]),
        verificaLimite: jest
            .fn()
            .mockImplementation((pagina, limite, total) => [pagina, limite]),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CoordenadoriasService,
                {
                    provide: PrismaService,
                    useValue: MockPrismaService
                },
                {
                    provide: AppService,
                    useValue: MockAppService
                }
            ]
        }).compile();
        service = module.get<CoordenadoriasService>(CoordenadoriasService)
        app = module.get<AppService>(AppService);
        prisma = module.get<PrismaService>(PrismaService)
    })

    //definição de services

    it('os services de coordenadorias devem ser definidos', () => {

        expect(service).toBeDefined()
        expect(app).toBeDefined()
        expect(prisma).toBeDefined()
    })

    //buscar por sigla

    it('deverá buscar coordenadoria pela sigla', async () => {

        const mockCoordenadoriaFind: Coordenadoria = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            sigla: 'CPSP',
            status: true,
            criadoEm: new Date('2023-01-01T00:00:00Z'),
            atualizadoEm: new Date('2025-03-25T12:00:00Z'),
        };

        (prisma.coordenadoria.findUnique as jest.Mock).mockResolvedValue(mockCoordenadoriaFind)

        const result = await service.buscarPorSigla(mockCoordenadoriaFind.sigla)

        expect(result).not.toBe(null)
        expect(result).toEqual(mockCoordenadoriaFind)
        expect(prisma.coordenadoria.findUnique).toHaveBeenCalledWith({
            where: {
                sigla: expect.any(String)
            }
        })
    })

    //criar coordenadoria 

    it('deverá criar uma coordenadoria', async () => {

    })

})