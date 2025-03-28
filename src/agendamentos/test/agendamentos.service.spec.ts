import { Agendamento } from "@prisma/client";
import { AgendamentosService } from "../agendamentos.service";
import { CreateAgendamentoDto } from "../dto/create-agendamento.dto";
import { UpdateCoordenadoriaDto } from "src/coordenadorias/dto/update-coordenadoria.dto";
import { Coordenadoria } from "@prisma/client";
import { Motivo } from "@prisma/client";
import { Usuario } from "@prisma/client";
import { AppService } from "src/app.service";
import { MotivosService } from "src/motivos/motivos.service";
import { CoordenadoriasService } from "src/coordenadorias/coordenadorias.service";
import { UsuariosService } from "src/usuarios/usuarios.service";
import { TestingModule, Test } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { mock } from "node:test";
import { $Enums } from "@prisma/client";

describe('Agendamento.service Testes', () => {
    let service: AgendamentosService;
    let motivo: MotivosService;
    let coordenadoria: CoordenadoriasService;
    let app: AppService;
    let prisma: PrismaService;
    let usuario: UsuariosService;

    const MockPrismaService = {
        agendamento: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn(),

        },
        motivo: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn()
        },
        coordenadoria: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn()
        },
        usuario: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn()
        },
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
                },
                {
                    provide: UsuariosService,
                    useValue: MockPrismaService
                }
            ]
        }).compile();

        service = module.get<AgendamentosService>(AgendamentosService);
        coordenadoria = module.get<CoordenadoriasService>(CoordenadoriasService);
        motivo = module.get<MotivosService>(MotivosService);
        app = module.get<AppService>(AppService);
        prisma = module.get<PrismaService>(PrismaService);
        usuario = module.get<UsuariosService>(UsuariosService);
    });

    it('os services de coordenadorias devem ser definidos', () => {
        expect(service).toBeDefined();
        expect(app).toBeDefined();
        expect(prisma).toBeDefined();
        expect(coordenadoria).toBeDefined();
        expect(motivo).toBeDefined();
    });

    // lista completa

    it('deve listar todos os agendamentos', async () => {
        const mockListAgendamentos: Agendamento[] = [
            {
                id: '123e4567-e89b-12d3-a456-426614174011',
                municipe: 'João Silva',
                rg: '12345678',
                cpf: '123.456.789-00',
                processo: 'Processo 1',
                dataInicio: new Date('2025-03-01T10:00:00Z'),
                dataFim: new Date('2025-03-01T11:00:00Z'),
                importado: false,
                legado: false,
                resumo: 'Resumo do agendamento 1',
                motivoId: '123e4567-e89b-12d3-a456-426614174005',
                coordenadoriaId: '123e4567-e89b-12d3-a456-426614174004',
                tecnicoId: '123e4567-e89b-12d3-a456-426614174003',
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: '123e4567-e89b-12d3-a456-426614174012',
                municipe: 'Maria Oliveira',
                rg: '87654321',
                cpf: '987.654.321-00',
                processo: 'Processo 2',
                dataInicio: new Date('2025-03-02T14:00:00Z'),
                dataFim: new Date('2025-03-02T15:00:00Z'),
                importado: true,
                legado: false,
                resumo: 'Resumo do agendamento 2',
                motivoId: '123e4567-e89b-12d3-a456-426614174006',
                coordenadoriaId: '123e4567-e89b-12d3-a456-426614174007',
                tecnicoId: '123e4567-e89b-12d3-a456-426614174008',
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: '123e4567-e89b-12d3-a456-426614174013',
                municipe: 'Carlos Pereira',
                rg: '11223344',
                cpf: '111.222.333-44',
                processo: 'Processo 3',
                dataInicio: new Date('2025-03-03T09:00:00Z'),
                dataFim: new Date('2025-03-03T10:00:00Z'),
                importado: false,
                legado: true,
                resumo: 'Resumo do agendamento 3',
                motivoId: '123e4567-e89b-12d3-a456-426614174009',
                coordenadoriaId: '123e4567-e89b-12d3-a456-426614174010',
                tecnicoId: '123e4567-e89b-12d3-a456-426614174011',
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
        ];

        (prisma.agendamento.findMany as jest.Mock).mockResolvedValue(mockListAgendamentos);

        const result = await service.listaCompleta();

        expect(result).not.toBe(null)
        expect(result).toEqual(mockListAgendamentos)
        expect(prisma.agendamento.findMany).toHaveBeenCalledWith({
            orderBy: { dataInicio: 'asc' }
        })


    })

    //criar agendamento

    it('deverá criar um agendamento', async () => {
        const mockCreateAgendamento: CreateAgendamentoDto = {
            municipe: 'João Silva',
            rg: '12345678',
            cpf: '123.456.789-00',
            tecnicoId: '123e4567-e89b-12d3-a456-426614174003',
            coordenadoriaId: '123e4567-e89b-12d3-a456-426614174004',
            motivoId: '123e4567-e89b-12d3-a456-426614174005',
            processo: 'Processo 1',
            dataInicio: new Date('2025-03-01T10:00:00Z'),
            dataFim: new Date('2025-03-01T11:00:00Z'),
            resumo: 'Resumo do agendamento',
        };

        const mockResponseAgendamento: Agendamento = {
            id: '123e4567-e89b-12d3-a456-426614174011',
            municipe: mockCreateAgendamento.municipe,
            rg: mockCreateAgendamento.rg,
            cpf: mockCreateAgendamento.cpf,
            tecnicoId: mockCreateAgendamento.tecnicoId,
            coordenadoriaId: mockCreateAgendamento.coordenadoriaId,
            motivoId: mockCreateAgendamento.motivoId,
            processo: mockCreateAgendamento.processo,
            dataInicio: mockCreateAgendamento.dataInicio,
            dataFim: mockCreateAgendamento.dataFim,
            resumo: mockCreateAgendamento.resumo,
            importado: false,
            legado: false,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
        };

        const mockFindMotivo: Motivo = {
            id: '123e4567-e89b-12d3-a456-426614174005',
            texto: 'Motivo de teste',
            status: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
        };

        const mockCoordenadoriaFind: Coordenadoria = {
            id: '123e4567-e89b-12d3-a456-426614174004',
            sigla: 'ABC',
            status: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
        };

        const mockUsuarioFind: Usuario = {
            id: '123e4567-e89b-12d3-a456-426614174012',
            nome: 'Carlos Pereira',
            login: 'carlos.pereira',
            email: 'carlos.pereira@example.com',
            permissao: 'USR',
            status: true,
            avatar: 'https://example.com/avatar.jpg',
            ultimoLogin: new Date(),
            criadoEm: new Date(),
            atualizadoEm: new Date(),
        };



        (prisma.motivo.findFirst as jest.Mock).mockResolvedValue(mockFindMotivo);
        (prisma.coordenadoria.findFirst as jest.Mock).mockResolvedValue(mockCoordenadoriaFind);
        (prisma.usuario.findFirst as jest.Mock).mockResolvedValue(mockUsuarioFind);
        (prisma.agendamento.create as jest.Mock).mockResolvedValue(mockResponseAgendamento)

        const result = await service.criar(mockCreateAgendamento)

        expect(result).not.toBe(null)
        expect(result).toEqual(mockResponseAgendamento)


    })

    //buscar tudo

    it('deverá buscar tudo de agendamentos', async () => {

        const mockListAgendamentos: Agendamento[] = [
            {
                id: '123e4567-e89b-12d3-a456-426614174011',
                municipe: 'João Silva',
                rg: '12345678',
                cpf: '123.456.789-00',
                processo: 'Processo 1',
                dataInicio: new Date('2025-03-01T10:00:00Z'),
                dataFim: new Date('2025-03-01T11:00:00Z'),
                importado: false,
                legado: false,
                resumo: 'Resumo do agendamento 1',
                motivoId: '123e4567-e89b-12d3-a456-426614174005',
                coordenadoriaId: '123e4567-e89b-12d3-a456-426614174004',
                tecnicoId: '123e4567-e89b-12d3-a456-426614174003',
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: '123e4567-e89b-12d3-a456-426614174012',
                municipe: 'Maria Oliveira',
                rg: '87654321',
                cpf: '987.654.321-00',
                processo: 'Processo 2',
                dataInicio: new Date('2025-03-02T14:00:00Z'),
                dataFim: new Date('2025-03-02T15:00:00Z'),
                importado: true,
                legado: false,
                resumo: 'Resumo do agendamento 2',
                motivoId: '123e4567-e89b-12d3-a456-426614174006',
                coordenadoriaId: '123e4567-e89b-12d3-a456-426614174007',
                tecnicoId: '123e4567-e89b-12d3-a456-426614174008',
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
            {
                id: '123e4567-e89b-12d3-a456-426614174013',
                municipe: 'Carlos Pereira',
                rg: '11223344',
                cpf: '111.222.333-44',
                processo: 'Processo 3',
                dataInicio: new Date('2025-03-03T09:00:00Z'),
                dataFim: new Date('2025-03-03T10:00:00Z'),
                importado: false,
                legado: true,
                resumo: 'Resumo do agendamento 3',
                motivoId: '123e4567-e89b-12d3-a456-426614174009',
                coordenadoriaId: '123e4567-e89b-12d3-a456-426614174010',
                tecnicoId: '123e4567-e89b-12d3-a456-426614174011',
                criadoEm: new Date(),
                atualizadoEm: new Date(),
            },
        ];

        const mockPaginacao = {
            total: 3,
            pagina: 1,
            limite: 10,
            data: mockListAgendamentos
        };

        const mockParams = {
            pagina: 1,
            limite: 10,
            busca: "Resumo",
        };

        (prisma.agendamento.count as jest.Mock).mockResolvedValue(3);
        jest.spyOn(app, 'verificaPagina').mockReturnValue([1, 10]);
        (prisma.agendamento.findMany as jest.Mock).mockResolvedValue(mockListAgendamentos);

        const result = await service.buscarTudo(
            mockParams.pagina,
            mockParams.limite,
            mockParams.busca
        )

        expect(result).not.toBe(null)
        expect(result.data).toEqual(mockListAgendamentos)
        expect(prisma.agendamento.count).toHaveBeenCalledWith({
            where: {
                OR: [
                    { municipe: { contains: expect.any(String) } },
                    { rg: { contains: expect.any(String) } },
                    { cpf: { contains: expect.any(String) } }
                ]
            }
        })
    })

    //buscar por id

    it('deverá buscar agendamento por id', async () => {

        const mockFindAgendamento: Agendamento = {
            id: '123e4567-e89b-12d3-a456-426614174014',
            municipe: 'Ana Souza',
            rg: '99887766',
            cpf: '999.888.777-66',
            processo: 'Processo 4',
            dataInicio: new Date('2025-03-04T10:00:00Z'),
            dataFim: new Date('2025-03-04T11:00:00Z'),
            importado: false,
            legado: false,
            resumo: 'Resumo do agendamento 4',
            motivoId: '123e4567-e89b-12d3-a456-426614174015',
            coordenadoriaId: '123e4567-e89b-12d3-a456-426614174016',
            tecnicoId: '123e4567-e89b-12d3-a456-426614174017',
            criadoEm: new Date(),
            atualizadoEm: new Date(),
        };


        (prisma.agendamento.findUnique as jest.Mock).mockResolvedValue(mockFindAgendamento);

        const result = await service.buscarPorId('123e4567-e89b-12d3-a456-426614174014')

        expect(result).not.toBe(null)
        expect(result).toEqual(mockFindAgendamento)
        expect(prisma.agendamento.findUnique).toHaveBeenCalledWith({
            where: {
                id: expect.any(String)
            }
        })
    })

    //importar arquivos .ICS

    it('deverá importar arquivos .ICS', async () => {
        // const mockFindCoordenadorias: Coordenadoria[] = [
        //     {
        //         id: '123e4567-e89b-12d3-a456-426614174018',
        //         sigla: 'XYZ',
        //         status: true,
        //         criadoEm: new Date(),
        //         atualizadoEm: new Date(),
        //     },
        //     {
        //         id: '123e4567-e89b-12d3-a456-426614174019',
        //         sigla: 'LMN',
        //         status: false,
        //         criadoEm: new Date(),
        //         atualizadoEm: new Date(),
        //     },
        //     {
        //         id: '123e4567-e89b-12d3-a456-426614174020',
        //         sigla: 'OPQ',
        //         status: true,
        //         criadoEm: new Date(),
        //         atualizadoEm: new Date(),
        //     },
        // ];

        // const mockDataFim: { resumo: string, dataInicio: Date, dataFim: Date, importado: boolean, legado: boolean, coordenadoriaId: string, motivoId: string }[] = [
        //     {
        //         resumo: 'Resumo do agendamento XYZ',
        //         dataInicio: new Date('2025-03-01T10:00:00Z'),
        //         dataFim: new Date('2025-03-01T11:00:00Z'),
        //         importado: true,
        //         legado: true,
        //         coordenadoriaId: mockFindCoordenadorias[0].id,
        //         motivoId: '123e4567-e89b-12d3-a456-426614174005',
        //     },
        //     {
        //         resumo: 'Resumo do agendamento LMN',
        //         dataInicio: new Date('2025-03-02T14:00:00Z'),
        //         dataFim: new Date('2025-03-02T15:00:00Z'),
        //         importado: true,
        //         legado: true,
        //         coordenadoriaId: mockFindCoordenadorias[1].id,
        //         motivoId: '123e4567-e89b-12d3-a456-426614174006',
        //     },
        //     {
        //         resumo: 'Resumo do agendamento OPQ',
        //         dataInicio: new Date('2025-03-03T09:00:00Z'),
        //         dataFim: new Date('2025-03-03T10:00:00Z'),
        //         importado: true,
        //         legado: true,
        //         coordenadoriaId: mockFindCoordenadorias[2].id,
        //         motivoId: '123e4567-e89b-12d3-a456-426614174007',
        //     },
        // ];

        // const mockAgendamentosProcessados = [
        //     {
        //         resumo: 'Reunião XYZ - Avaliação de Projetos',
        //         dataInicio: new Date('2025-03-01T10:00:00Z'),
        //         dataFim: new Date('2025-03-01T11:00:00Z'),
        //         coordenadoriaId: '123e4567-e89b-12d3-a456-426614174018',
        //         motivoId: '123e4567-e89b-12d3-a456-426614174005',
        //         importado: true,
        //         legado: true
        //     },
        //     {
        //         resumo: 'Treinamento LMN - Capacitação',
        //         dataInicio: new Date('2025-03-02T14:00:00Z'),
        //         dataFim: new Date('2025-03-02T15:00:00Z'),
        //         coordenadoriaId: '123e4567-e89b-12d3-a456-426614174019',
        //         motivoId: '123e4567-e89b-12d3-a456-426614174006',
        //         importado: true,
        //         legado: true
        //     }
        // ];

        // const mockFile = {
        //     fieldname: 'arquivo',
        //     originalname: 'calendario.ics',
        //     encoding: 'utf8',
        //     mimetype: 'text/calendar',
        //     destination: './uploads/',
        //     filename: 'calendario_123.ics',
        //     path: './uploads/calendario_123.ics',
        //     size: 1024
        // } as Express.Multer.File;

        // (prisma.agendamento.createMany as jest.Mock).mockResolvedValue(mockAgendamentosProcessados)

        // const result = await service.importarICS(mockFile)

        // expect(result).not.toBe(null)
        // expect(result).toEqual(mockDataFim)

    })

    //dashboard

    it('deverá retornar um dashboard', async () => {
        const dashParams = {
            motivoId: '123e4567-e89b-12d3-a456-426614174005',
            coordenadoriaId: '123e4567-e89b-12d3-a456-426614174018',
            dataInicio: '2025-03-01T10:00:00Z',
            dataFim: '2025-03-01T11:00:00Z',
        };

        const mockMotivos: Motivo[] = [
            {
                id: "1",
                texto: "Consulta médica",
                status: true,
                criadoEm: new Date("2025-01-01"),
                atualizadoEm: new Date("2025-01-01"),
            },
            {
                id: "2",
                texto: "Reunião de trabalho",
                status: true,
                criadoEm: new Date("2025-01-02"),
                atualizadoEm: new Date("2025-01-02"),
            },
            {
                id: "3",
                texto: "Entrevista",
                status: true,
                criadoEm: new Date("2025-01-03"),
                atualizadoEm: new Date("2025-01-03"),
            }
        ];

        // Mock de lista de agendamentos
        const mockAgendamentos: Agendamento[] = [
            {
                id: "1",
                municipe: "João Silva",
                rg: "12345678",
                cpf: "123.456.789-00",
                processo: "Processo 1",
                dataInicio: new Date("2025-03-28T09:00:00"),
                dataFim: new Date("2025-03-28T10:00:00"),
                importado: false,
                legado: false,
                resumo: "Consulta médica com Dr. João",
                motivoId: "1",
                coordenadoriaId: "1",
                tecnicoId: "1",
                criadoEm: new Date("2025-03-01"),
                atualizadoEm: new Date("2025-03-01"),
            },
            {
                id: "2",
                municipe: "Maria Oliveira",
                rg: "87654321",
                cpf: "987.654.321-00",
                processo: "Processo 2",
                dataInicio: new Date("2025-03-28T11:00:00"),
                dataFim: new Date("2025-03-28T12:00:00"),
                importado: false,
                legado: false,
                resumo: "Reunião de trabalho com equipe",
                motivoId: "2",
                coordenadoriaId: "2",
                tecnicoId: "2",
                criadoEm: new Date("2025-03-02"),
                atualizadoEm: new Date("2025-03-02"),
            }
        ];

        const mockDashboard = {
            coordenadorias: [] as Coordenadoria[],
            motivos: [] as Motivo[],
            agendamentosMes: [{ label: "Março/2025", value: 0 }],
            total: 0,
            totalAno: 0,
            totalMes: 0,
            totalDia: 0
        };

        const gte = (dashParams.dataInicio && dashParams.dataFim) && (dashParams.dataInicio !== '' && dashParams.dataFim !== '') ? new Date(dashParams.dataInicio) : undefined;
        const lte = (dashParams.dataInicio && dashParams.dataFim) && (dashParams.dataInicio !== '' && dashParams.dataFim !== '') ? new Date(dashParams.dataFim) : undefined;

        (prisma.agendamento.findMany as jest.Mock).mockResolvedValue(mockAgendamentos)

        const result = await service.dashboard(dashParams)


    })


});