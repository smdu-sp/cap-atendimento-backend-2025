import { CreateCoordenadoriaDto } from "../dto/create-coordenadoria.dto";
import { UpdateCoordenadoriaDto } from "../dto/update-coordenadoria.dto";
import { Agendamento } from "@prisma/client";
import { Coordenadoria } from "@prisma/client";
import { CoordenadoriasService } from "../coordenadorias.service";
import { PrismaService } from "src/prisma/prisma.service";
import { AppService } from "src/app.service";
import { TestingModule, Test } from "@nestjs/testing";
import exp from "constants";
import { contains } from "class-validator";

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

        const mockCreateCoordenadoria: CreateCoordenadoriaDto = {
            sigla: 'ABC',
            status: true,
        };

        const mockResponseCoordenadoria: Coordenadoria = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            sigla: 'ABC',
            status: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
        };

        jest.spyOn(service, 'buscarPorSigla').mockResolvedValue(null);
        (prisma.coordenadoria.create as jest.Mock).mockResolvedValue(mockResponseCoordenadoria);

        const result = await service.criar(mockCreateCoordenadoria)

        expect(result).not.toBe(null)
        expect(result).toEqual(mockResponseCoordenadoria)
        expect(prisma.coordenadoria.create).toHaveBeenCalledWith({
            data: mockCreateCoordenadoria
        })

    })

    //buscar tudo

    it('deverá buscar todas coordenadorias', async () => {
        const mockListCoordenadorias: Coordenadoria[] = [
            {
                id: '123e4567-e89b-12d3-a456-426614174000',
                sigla: 'ABC',
                status: true,
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: '123e4567-e89b-12d3-a456-426614174001',
                sigla: 'DEF',
                status: false,
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: '123e4567-e89b-12d3-a456-426614174002',
                sigla: 'GHI',
                status: true,
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
        ];

        const mockPaginacao = {
            total: 3,
            pagina: 1,
            limite: 10,
            data: mockListCoordenadorias
        };

        const mockParams = {
            pagina: 1,
            limite: 10,
            busca: null,
        };

        (prisma.coordenadoria.count as jest.Mock).mockResolvedValue(3);
        jest.spyOn(app, 'verificaPagina').mockReturnValue([1, 10]);
        (prisma.coordenadoria.findMany as jest.Mock).mockResolvedValue(mockListCoordenadorias);

        const result = await service.buscarTudo(
            mockParams.pagina,
            mockParams.limite
        )

        expect(result).not.toBe(null)
        expect(result.data).toEqual(mockListCoordenadorias)
        expect(prisma.coordenadoria.count).toHaveBeenCalledWith({
            where: {}
        })
        expect(prisma.coordenadoria.findMany).toHaveBeenCalledWith({
            where: {
            },
            skip: (mockParams.pagina - 1) * Number(mockParams.limite),
            take: Number(mockParams.limite),
            orderBy: { sigla: 'asc' },
        })


    })

    it('deverá buscar por ID', async () => {
        const mockFindCoordenadoria: Coordenadoria = {
            id: '123e4567-e89b-12d3-a456-426614174003',
            sigla: 'JKL',
            status: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
        };

        (prisma.coordenadoria.findUnique as jest.Mock).mockResolvedValue(mockFindCoordenadoria);

        const result = await service.buscarPorId(mockFindCoordenadoria.id)

        expect(result).not.toBe(null)
        expect(result).toEqual(mockFindCoordenadoria)
        expect(prisma.coordenadoria.findUnique).toHaveBeenCalledWith({
            where: {
                id: expect.any(String)
            }
        })
    })

    it('deverá atualizar uma coordenadoria', async () => {
        const mockAtualizarCoordenadoria: Coordenadoria = {
            id: '123e4567-e89b-12d3-a456-426614174004',
            sigla: 'MNO',
            status: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
        };

        const updateParams = {
            id: mockAtualizarCoordenadoria.id,
            sigla: 'PQR',
        };

        const mockAtualizadaCoordenadoria: Coordenadoria = {
            ...mockAtualizarCoordenadoria,
            sigla: updateParams.sigla,
        };

        jest.spyOn(service, 'buscarPorId').mockResolvedValue(mockAtualizarCoordenadoria);
        jest.spyOn(service, 'buscarPorSigla').mockResolvedValue(null);
        (prisma.coordenadoria.update as jest.Mock).mockResolvedValue(mockAtualizadaCoordenadoria);

        const result = await service.atualizar(updateParams.id, updateParams);

        expect(result).not.toBe(null);
        expect(prisma.coordenadoria.update).toHaveBeenCalledWith({
            where: { id: updateParams.id },
            data: updateParams,
        });
    });

    it('deverá deetar uma coordenadoria', async () => {
        const mockDesativarCoordenadoria: Coordenadoria = {
            id: '123e4567-e89b-12d3-a456-426614174004',
            sigla: 'MNO',
            status: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
        };

        jest.spyOn(service, 'buscarPorId').mockResolvedValue(null);
        (prisma.coordenadoria.update as jest.Mock).mockResolvedValue({ desativado: true });

        const result = await service.desativar(mockDesativarCoordenadoria.id);

        expect(result).not.toBe(null);
        expect(result).toEqual({ desativado: true });
        expect(prisma.coordenadoria.update).toHaveBeenCalledWith({
            where: { id: mockDesativarCoordenadoria.id },
            data: { status: false },
        })
    })
})