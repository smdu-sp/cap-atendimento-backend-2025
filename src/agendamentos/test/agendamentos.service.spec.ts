'use strict';
import { Agendamento } from '@prisma/client';
import { AgendamentosService } from '../agendamentos.service';
import { CreateAgendamentoDto } from '../dto/create-agendamento.dto';
import { Coordenadoria } from '@prisma/client';
import { Motivo } from '@prisma/client';
import { Usuario } from '@prisma/client';
import { AppService } from 'src/app.service';
import { MotivosService } from 'src/motivos/motivos.service';
import { CoordenadoriasService } from 'src/coordenadorias/coordenadorias.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { TestingModule, Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';


describe('Agendamento.service Testes', () => {
    let service: AgendamentosService;
    let motivo: MotivosService;
    let coordenadoria: CoordenadoriasService;
    let app: AppService;
    let prisma: PrismaService;
    let usuario: UsuariosService;

    const MockPrismaService = {
        $queryRawUnsafe: jest.fn(),
        agendamento: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn(),
            createMany: jest.fn(),
        },
        motivo: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn(),
            createMany: jest.fn(),
        },
        coordenadoria: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn(),
            createMany: jest.fn(),
        },
        usuario: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn(),
            createMany: jest.fn(),
        },
    };

    const MockAppService = {
        verificaPagina: jest.fn().mockImplementation((pagina, limite) => [pagina, limite]),
        verificaLimite: jest.fn().mockImplementation((pagina, limite, total) => [pagina, limite]),
    };


    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AgendamentosService,
                {
                    provide: PrismaService,
                    useValue: MockPrismaService,
                },
                {
                    provide: CoordenadoriasService,
                    useValue: MockPrismaService.coordenadoria,
                },
                {
                    provide: MotivosService,
                    useValue: MockPrismaService.motivo,
                },
                {
                    provide: AppService,
                    useValue: MockAppService,
                },
                {
                    provide: UsuariosService,
                    useValue: MockPrismaService,
                },
            ],
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
                email: '',
                status: 'AGENDADO'
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
                email: '',
                status: 'AGENDADO'
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
                email: '',
                status: 'AGENDADO'
            },
        ];

        (prisma.agendamento.findMany as jest.Mock).mockResolvedValue(
            mockListAgendamentos,
        );

        const result = await service.listaCompleta();

        expect(result).not.toBe(null);
        expect(result).toEqual(mockListAgendamentos);
        expect(prisma.agendamento.findMany).toHaveBeenCalledWith({
            orderBy: { dataInicio: 'asc' },
        });
    });

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
            email: '',
            status: 'AGENDADO'
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
            nomeSocial: 'lukuzinha',
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
        (prisma.coordenadoria.findFirst as jest.Mock).mockResolvedValue(
            mockCoordenadoriaFind,
        );
        (prisma.usuario.findFirst as jest.Mock).mockResolvedValue(mockUsuarioFind);
        (prisma.agendamento.create as jest.Mock).mockResolvedValue(
            mockResponseAgendamento,
        );

        const result = await service.criar(mockCreateAgendamento);

        expect(result).not.toBe(null);
        expect(result).toEqual(mockResponseAgendamento);
    });

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
                email: '',
                status: 'AGENDADO'
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
                email: '',
                status: 'AGENDADO'
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
                email: '',
                status: 'AGENDADO'
            },
        ];

        const mockPaginacao = {
            total: 3,
            pagina: 1,
            limite: 10,
            data: mockListAgendamentos,
        };

        const mockParams = {
            pagina: 1,
            limite: 10,
            busca: 'Resumo',
        };

        (prisma.agendamento.count as jest.Mock).mockResolvedValue(3);
        jest.spyOn(app, 'verificaPagina').mockReturnValue([1, 10]);
        (prisma.agendamento.findMany as jest.Mock).mockResolvedValue(
            mockListAgendamentos,
        );

        const result = await service.buscarTudo(
            mockParams.pagina,
            mockParams.limite,
            mockParams.busca,
        );

        expect(result).not.toBe(null);
        expect(result.data).toEqual(mockListAgendamentos);
        expect(prisma.agendamento.count).toHaveBeenCalledWith({
            where: {
                OR: [
                    { municipe: { contains: expect.any(String) } },
                    { rg: { contains: expect.any(String) } },
                    { cpf: { contains: expect.any(String) } },
                ],
            },
        });
    });

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
            email: '',
            status: 'AGENDADO'
        };

        (prisma.agendamento.findUnique as jest.Mock).mockResolvedValue(
            mockFindAgendamento,
        );

        const result = await service.buscarPorId(
            '123e4567-e89b-12d3-a456-426614174014',
        );

        expect(result).not.toBe(null);
        expect(result).toEqual(mockFindAgendamento);
        expect(prisma.agendamento.findUnique).toHaveBeenCalledWith({
            where: {
                id: expect.any(String),
            },
        });
    });

    it('deve processar um arquivo ICS fictício', async () => {
        // // 1. Cria um arquivo fake (não existe fisicamente)
        // const arquivoFake = {
        //     path: '/caminho/ficticio.ics',
        //     originalname: 'fake.ics',
        // } as Express.Multer.File;

        // // 2. Mocka o fs para simular a leitura do arquivo
        // const dadosFakeICS = `
        //   BEGIN:VCALENDAR
        //   BEGIN:VEVENT
        //   SUMMARY:Reunião CT - Motivo Importante
        //   DTSTART:20240101T100000Z
        //   DTEND:20240101T110000Z
        //   END:VEVENT
        //   END:VCALENDAR
        // `;

        // (fs.readFileSync as jest.Mock).mockReturnValue(dadosFakeICS);

        // // 3. Mocka o ical para retornar eventos processados
        // (ical.sync.parseFile as jest.Mock).mockReturnValue({
        //     'evento1': {
        //         type: 'VEVENT',
        //         summary: 'Reunião CT - Motivo Importante',
        //         start: new Date('2024-01-01T10:00:00Z'),
        //         end: new Date('2024-01-01T11:00:00Z')
        //     }
        // });

        // // 4. Mocka o Prisma para retornar dados de coordenadorias/motivos
        // MockPrismaService.coordenadoria.findMany.mockResolvedValue([
        //     { id: '1', sigla: 'CT' }
        // ]);
        // MockPrismaService.motivo.findMany.mockResolvedValue([
        //     { id: '2', texto: 'Motivo Importante' }
        // ]);

        // // 5. Executa o teste
        // const resultado = await service.importarICS(arquivoFake);

        // // 6. Verificações
        // expect(fs.readFileSync).toHaveBeenCalledWith('/caminho/ficticio.ics');
        // expect(MockPrismaService.agendamento.createMany).toHaveBeenCalled();
        // expect(resultado.count).toBe(1); // Supondo que 1 evento foi criado
    });

});
