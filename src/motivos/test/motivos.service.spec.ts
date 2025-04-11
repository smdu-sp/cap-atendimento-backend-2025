import { CreateMotivoDto } from '../dto/create-motivo.dto';
import { UpdateMotivoDto } from '../dto/update-motivo.dto';
import { MotivosService } from '../motivos.service';
import { Motivo } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { ExpressAdapter } from '@nestjs/platform-express';
import exp from 'constants';
import { contains } from 'class-validator';

describe('Motivo.service tests', () => {
  let service: MotivosService;
  let app: AppService;
  let prisma: PrismaService;

  const MockPrismaService = {
    motivo: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
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
        MotivosService,
        {
          provide: PrismaService,
          useValue: MockPrismaService,
        },
        {
          provide: AppService,
          useValue: MockAppService,
        },
      ],
    }).compile();
    service = module.get<MotivosService>(MotivosService);
    prisma = module.get<PrismaService>(PrismaService);
    app = module.get<AppService>(AppService);
  });

  it('os serviços deverão ser definidos', () => {
    expect(service).toBeDefined();
    expect(app).toBeDefined();
    expect(prisma).toBeDefined();
  });

  //buscar por texto

  it('deverá buscar o motivo por texto', async () => {
    const mockFindMotivo: Motivo = {
      id: '123e4567-e89b-12d3-a456-426614174005',
      texto: 'texto teste',
      status: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    (prisma.motivo.findFirst as jest.Mock).mockResolvedValue(mockFindMotivo);

    const result = await service.buscarPorTexto('texto teste');

    expect(result).not.toBe(null);
    expect(result).toEqual(mockFindMotivo);
  });

  //criar motivo

  it('deverá criar um motivo', async () => {
    const mockCreateMotivo: CreateMotivoDto = {
      texto: 'Motivo de teste',
      status: true,
    };

    const mockResponseMotivo: Motivo = {
      id: '123e4567-e89b-12d3-a456-426614174006',
      texto: mockCreateMotivo.texto,
      status: mockCreateMotivo.status ?? true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    jest.spyOn(service, 'buscarPorTexto').mockResolvedValue(null);
    (prisma.motivo.create as jest.Mock).mockResolvedValue(mockResponseMotivo);

    const result = await service.criar(mockCreateMotivo);

    expect(result).not.toBe(null);
    expect(result).toEqual(mockResponseMotivo);
    expect(prisma.motivo.create).toHaveBeenCalledWith({
      data: mockCreateMotivo,
    });
  });

  //lista completa

  it('deverá listar todos os motivos', async () => {
    const mockListMotivos: Motivo[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174007',
        texto: 'Motivo 1',
        status: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174008',
        texto: 'Motivo 2',
        status: false,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174009',
        texto: 'Motivo 3',
        status: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
    ];

    (prisma.motivo.findMany as jest.Mock).mockResolvedValue(mockListMotivos);

    const result = await service.listaCompleta();

    expect(result).not.toBe(null);
    expect(result).toEqual(mockListMotivos);
    expect(prisma.motivo.findMany).toHaveBeenCalledWith({
      where: { status: true },
      orderBy: { texto: 'asc' },
    });
  });

  //buscar tudo

  it('deverá buscar tudo em motivos', async () => {
    const mockListMotivos: Motivo[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174007',
        texto: 'Motivo 1',
        status: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174008',
        texto: 'Motivo 2',
        status: false,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174009',
        texto: 'Motivo 3',
        status: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
    ];

    const mockPaginacao = {
      total: 3,
      pagina: 1,
      limite: 10,
      data: mockListMotivos,
    };

    const mockParams = {
      usuario: null,
      pagina: 1,
      limite: 10,
      status: 1,
      busca: 'Motivo',
    };

    (prisma.motivo.count as jest.Mock).mockResolvedValue(3);
    jest.spyOn(app, 'verificaPagina').mockReturnValue([1, 10]);
    (prisma.motivo.findMany as jest.Mock).mockResolvedValue(mockListMotivos);

    const result = await service.buscarTudo(
      mockParams.pagina,
      mockParams.limite,
      undefined,
      mockParams.busca,
    );

    expect(result).not.toBe(null);
    expect(result).toEqual(mockPaginacao);
    expect(prisma.motivo.count).toHaveBeenCalledWith({
      where: {
        OR: [{ texto: { contains: expect.any(String) } }],
        status: undefined,
      },
    });
    expect(prisma.motivo.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ texto: { contains: expect.any(String) } }],
        status: undefined,
      },
      skip: (mockParams.pagina - 1) * mockParams.limite,
      take: mockParams.limite,
      orderBy: { texto: 'asc' },
    });
  });

  //buscar id

  it('deverá buscar motivo pelo ID', async () => {
    const mockMotivo: Motivo = {
      id: '123e4567-e89b-12d3-a456-426614174010',
      texto: 'Motivo adicional',
      status: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    (prisma.motivo.findUnique as jest.Mock).mockResolvedValue(mockMotivo);

    const result = await service.buscarPorId(mockMotivo.id);

    expect(result).not.toBe(null);
    expect(result).toEqual(mockMotivo);
    expect(prisma.motivo.findUnique).toHaveBeenCalledWith({
      where: {
        id: mockMotivo.id,
      },
    });
  });

  //atualizar motivo

  it('deverá atualizar um motivo', async () => {
    const mockMotivo: Motivo = {
      id: '123e4567-e89b-12d3-a456-426614174010',
      texto: 'Motivo adicional',
      status: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    const updateParams = {
      texto: 'Novo motivo adicional', // Valor diferente de mockMotivo.texto
    };

    const mockMotivoAtualizado: Motivo = {
      ...mockMotivo,
      texto: updateParams.texto,
    };

    jest.spyOn(service, 'buscarPorId').mockResolvedValue(mockMotivo);
    jest.spyOn(service, 'buscarPorTexto').mockResolvedValue(null);
    (prisma.motivo.update as jest.Mock).mockResolvedValue(mockMotivoAtualizado);

    const result = await service.atualizar(mockMotivo.id, updateParams);

    expect(result).not.toBe(null);
    expect(result).toEqual(mockMotivoAtualizado);
    expect(prisma.motivo.update).toHaveBeenCalledWith({
      where: {
        id: expect.any(String),
      },
      data: updateParams,
    });
  });

  it('deverá desativar um motivo', async () => {
    const mockMotivo: Motivo = {
      id: '123e4567-e89b-12d3-a456-426614174010',
      texto: 'Motivo adicional',
      status: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    jest.spyOn(service, 'buscarPorId').mockResolvedValue(mockMotivo);
    (prisma.motivo.update as jest.Mock).mockResolvedValue({ desativado: true });

    const result = await service.desativar(mockMotivo.id);

    expect(result).not.toBe(null);
    expect(result).toEqual({ desativado: true });
    expect(prisma.motivo.update).toHaveBeenCalledWith({
      where: {
        id: expect.any(String),
      },
      data: { status: false },
    });
  });
});
