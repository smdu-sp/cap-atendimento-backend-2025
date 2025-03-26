import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
// import { AppService } from 'src/app.service';
import { UsuarioResponseDTO } from '../dto/usuario-response.dto';
import { AppService } from 'src/app.service';
import { SguService } from 'src/prisma/sgu.service';
import { UsuariosService } from '../usuarios.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { $Enums, Usuario } from '@prisma/client';
import { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import exp from 'constants';
import { count } from 'console';

describe('Usuarios.service testes unitários', () => {
  let service: UsuariosService;
  let prisma: PrismaService;
  let sgu: SguService;
  let app: AppService;

  const MockPrismaService = {
    usuario: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
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
        UsuariosService,
        {
          provide: PrismaService,
          useValue: MockPrismaService,
        },
        {
          provide: SguService,
          useValue: MockPrismaService,
        },
        {
          provide: AppService,
          useValue: MockAppService,
        },
      ],
    }).compile();
    service = module.get<UsuariosService>(UsuariosService);
    prisma = module.get<PrismaService>(PrismaService);
    sgu = module.get<SguService>(SguService);
    app = module.get<AppService>(AppService);
  });

  it('os serviços deverão estar definidos', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
    expect(app).toBeDefined();
    expect(sgu).toBeDefined();
  });

  //listagem de usuarios

  it('deverá listar todos os usuários do banco de dados', async () => {
    const mockUsuarios = [
      {
        id: '1',
        nome: 'João Silva',
        login: 'joao.silva',
        email: 'joao.silva@example.com',
        status: true,
        avatar: 'avatar1.png',
        permissao: $Enums.Permissao.DEV,
        ultimoLogin: new Date('2025-03-24T10:00:00Z'),
        criadoEm: new Date('2025-01-01T10:00:00Z'),
        atualizadoEm: new Date('2025-03-24T10:00:00Z'),
      },
      {
        id: '2',
        nome: 'Maria Souza',
        login: 'maria.souza',
        email: 'maria.souza@example.com',
        status: true,
        avatar: 'avatar2.png',
        permissao: $Enums.Permissao.ADM,
        ultimoLogin: new Date('2025-03-24T11:00:00Z'),
        criadoEm: new Date('2025-02-01T11:00:00Z'),
        atualizadoEm: new Date('2025-03-24T11:00:00Z'),
      },
      {
        id: '3',
        nome: 'Carlos Pereira',
        login: 'carlos.pereira',
        email: 'carlos.pereira@example.com',
        status: false,
        avatar: 'avatar3.png',
        permissao: $Enums.Permissao.TEC,
        ultimoLogin: new Date('2025-03-24T12:00:00Z'),
        criadoEm: new Date('2025-03-01T12:00:00Z'),
        atualizadoEm: new Date('2025-03-24T12:00:00Z'),
      },
    ];

    (prisma.usuario.findMany as jest.Mock).mockResolvedValue(mockUsuarios);
    const result = await service.listaCompleta();

    expect(result).not.toBe(null);
    expect(result).toEqual(mockUsuarios);
  });

  //criação de usuários

  it('deverá verificar se um usuário pode ser criado', async () => {

    const mockCreateUser: CreateUsuarioDto = {
        nome: 'Carlos Pereira',
        nomeSocial: 'Carlão',
        login: 'carlos.pereira',
        email: 'carlos.pereira@example.com',
        status: false,
        avatar: 'avatar3.png',
        permissao: $Enums.Permissao.DEV, // Permissão do tipo DEV
      };      

    const mockResponseUser: UsuarioResponseDTO = {
      id: '3',
      nome: 'Carlos Pereira',
      nomeSocial: 'Carlão',
      login: 'carlos.pereira',
      email: 'carlos.pereira@example.com',
      status: false,
      avatar: 'avatar3.png',
      permissao: $Enums.Permissao.DEV,
      ultimoLogin: new Date('2025-03-24T12:00:00Z'),
      criadoEm: new Date('2025-03-01T12:00:00Z'),
      atualizadoEm: new Date('2025-03-24T12:00:00Z'),
    };

    const mockUserLogado: Usuario = {
        id: '3',
        nome: 'Carlos Pereira',
        nomeSocial: 'Carlão',
        login: 'carlos.pereira',
        email: 'carlos.pereira@example.com',
        permissao: $Enums.Permissao.ADM, 
        status: true,
        avatar: 'avatar3.png',
        ultimoLogin: new Date('2025-03-24T12:00:00Z'),
        criadoEm: new Date('2025-03-01T12:00:00Z'),
        atualizadoEm: new Date('2025-03-24T12:00:00Z'),
      };      

    jest.spyOn(service, 'buscarPorEmail').mockResolvedValue(null);
    jest.spyOn(service, 'buscarPorLogin').mockResolvedValue(null);
    jest.spyOn(service, 'validaPermissaoCriador').mockReturnValue($Enums.Permissao.DEV);

    (prisma.usuario.create as jest.Mock).mockResolvedValue(mockResponseUser);
    
    const result = await service.criar(mockCreateUser, mockUserLogado)

    expect(result).not.toBeNull()
    expect(result).toEqual(mockResponseUser)
    expect(service.buscarPorEmail).toHaveBeenCalledWith(mockCreateUser.email)
    expect(service.buscarPorLogin).toHaveBeenCalledWith(mockCreateUser.login)
    expect(prisma.usuario.create).toHaveBeenCalledWith({
        data: mockCreateUser
    })
  });

  it('deverá buscar todos os usuários', async () => {
    const mockUsuarios = [
      {
        id: '1',
        nome: 'João Silva',
        login: 'joao.silva',
        email: 'joao.silva@example.com',
        status: true,
        avatar: 'avatar1.png',
        permissao: $Enums.Permissao.DEV,
        ultimoLogin: new Date('2025-03-24T10:00:00Z'),
        criadoEm: new Date('2025-01-01T10:00:00Z'),
        atualizadoEm: new Date('2025-03-24T10:00:00Z'),
      },
      {
        id: '2',
        nome: 'Maria Souza',
        login: 'maria.souza',
        email: 'maria.souza@example.com',
        status: true,
        avatar: 'avatar2.png',
        permissao: $Enums.Permissao.ADM,
        ultimoLogin: new Date('2025-03-24T11:00:00Z'),
        criadoEm: new Date('2025-02-01T11:00:00Z'),
        atualizadoEm: new Date('2025-03-24T11:00:00Z'),
      },
      {
        id: '3',
        nome: 'Carlos Pereira',
        login: 'carlos.pereira',
        email: 'carlos.pereira@example.com',
        status: false,
        avatar: 'avatar3.png',
        permissao: $Enums.Permissao.TEC,
        ultimoLogin: new Date('2025-03-24T12:00:00Z'),
        criadoEm: new Date('2025-03-01T12:00:00Z'),
        atualizadoEm: new Date('2025-03-24T12:00:00Z'),
      },
    ];
  
    const mockPaginacao = {
      total: 3,
      pagina: 1,
      limite: 10,
      data: mockUsuarios,
    };
  
    const mockParams = {
      usuario: null,
      pagina: 1,
      limite: 10,
      status: 1,
      busca: 'example',
    };
  
    (prisma.usuario.count as jest.Mock).mockResolvedValue(3);
    jest.spyOn(app, 'verificaPagina').mockReturnValue([1, 10]);
    (prisma.usuario.findMany as jest.Mock).mockResolvedValue(mockUsuarios);
  
    const result = await service.buscarTudo(
      mockParams.usuario,
      mockParams.pagina,
      mockParams.limite,
      mockParams.status,
      mockParams.busca,
    );
  
    expect(result).not.toBeNull();
    expect(result).toEqual(mockPaginacao);

    expect(prisma.usuario.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { nome: { contains: expect.any(String) } },
            { nomeSocial: { contains: expect.any(String) } },
            { login: { contains: expect.any(String) } },
            { email: { contains: expect.any(String) } },
          ],
        },
      });
  
    expect(prisma.usuario.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { nome: { contains: mockParams.busca } },
          { nomeSocial: { contains: mockParams.busca } },
          { login: { contains: mockParams.busca } },
          { email: { contains: mockParams.busca } },
        ],
        status: undefined, 
      },
      skip: (mockParams.pagina - 1) * mockParams.limite,
      take: mockParams.limite,
      orderBy: { nome: 'asc' },
    });

  });
});
