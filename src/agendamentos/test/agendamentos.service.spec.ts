import { Agendamento } from "@prisma/client";
import { AgendamentosService } from "../agendamentos.service";
import { CreateAgendamentoDto } from "../dto/create-agendamento.dto";
import { UpdateCoordenadoriaDto } from "src/coordenadorias/dto/update-coordenadoria.dto";
import { Coordenadoria } from "@prisma/client";
import { Motivo } from "@prisma/client";
import { AppService } from "src/app.service";
import { MotivosService } from "src/motivos/motivos.service";
import { CoordenadoriasService } from "src/coordenadorias/coordenadorias.service";
import { TestingModule, Test } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";

describe('Agendamento.service Testes', () => {
    let service: AgendamentosService;
    let motivo: MotivosService;
    let coordenadoria: CoordenadoriasService;
    let app: AppService;
    let prisma: PrismaService;

    const MockPrismaService = {
        agendamento: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn()
        },
        motivo: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn()
        },
        coordenadoria: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn()
        }
    };

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
                AgendamentosService,
                {
                    provide: PrismaService,
                    useValue: MockPrismaService
                },
                {
                    provide: CoordenadoriasService,
                    useValue: MockPrismaService.coordenadoria
                },
                {
                    provide: MotivosService,
                    useValue: MockPrismaService.motivo
                },
                {
                    provide: AppService,
                    useValue: MockAppService
                }
            ]
        }).compile();

        service = module.get<AgendamentosService>(AgendamentosService);
        coordenadoria = module.get<CoordenadoriasService>(CoordenadoriasService);
        motivo = module.get<MotivosService>(MotivosService);
        app = module.get<AppService>(AppService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('os services de coordenadorias devem ser definidos', () => {
        expect(service).toBeDefined();
        expect(app).toBeDefined();
        expect(prisma).toBeDefined();
        expect(coordenadoria).toBeDefined();
        expect(motivo).toBeDefined();
    });
});