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
        permissao: $Enums.Permissao.ADM,
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
      permissao: $Enums.Permissao.DEV,
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

  //buscar todos usuários

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
        permissao: $Enums.Permissao.ADM,
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

  //buscar usuario por id

  it('deverá buscar um usuario pelo id', async () => {
    const mockResponseUser: UsuarioResponseDTO = {
      id: '123456',
      nome: 'João da Silva',
      nomeSocial: 'João',
      login: 'joao.silva',
      email: 'joao.silva@example.com',
      status: true,
      avatar: 'https://example.com/avatar.jpg',
      permissao: $Enums.Permissao.ADM,
      ultimoLogin: new Date('2025-03-25T12:00:00Z'),
      criadoEm: new Date('2023-01-01T00:00:00Z'),
      atualizadoEm: new Date('2025-03-25T12:00:00Z')
    };

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockResponseUser)

    const result = await service.buscarPorId('123456')

    expect(result).not.toBe(null)
    expect(result).toEqual(mockResponseUser)
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: {
        id: '123456'
      }
    })
  })

  //buscar usuario por email

  it('deverá buscar um usuario pelo email', async () => {
    const mockResponseUser: UsuarioResponseDTO = {
      id: '123456',
      nome: 'João da Silva',
      nomeSocial: 'João',
      login: 'joao.silva',
      email: 'joao.silva@example.com',
      status: true,
      avatar: 'https://example.com/avatar.jpg',
      permissao: $Enums.Permissao.ADM,
      ultimoLogin: new Date('2025-03-25T12:00:00Z'),
      criadoEm: new Date('2023-01-01T00:00:00Z'),
      atualizadoEm: new Date('2025-03-25T12:00:00Z')
    };

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockResponseUser)

    const result = await service.buscarPorEmail('joao.silva@example.com')

    expect(result).not.toBe(null)
    expect(result).toEqual(mockResponseUser)
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'joao.silva@example.com'
      }
    })
  })

  //buscar usuario por login

  it('deverá buscar um usuario pelo login', async () => {
    const mockResponseUser: UsuarioResponseDTO = {
      id: '123456',
      nome: 'João da Silva',
      nomeSocial: 'João',
      login: 'joao.silva',
      email: 'joao.silva@example.com',
      status: true,
      avatar: 'https://example.com/avatar.jpg',
      permissao: $Enums.Permissao.ADM,
      ultimoLogin: new Date('2025-03-25T12:00:00Z'),
      criadoEm: new Date('2023-01-01T00:00:00Z'),
      atualizadoEm: new Date('2025-03-25T12:00:00Z')
    };

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockResponseUser)

    const result = await service.buscarPorLogin('joao.silva')

    expect(result).not.toBe(null)
    expect(result).toEqual(mockResponseUser)
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: {
        login: 'joao.silva'
      }
    })
  })

  //atualizar usuario

  it('deverá atualizar um usuario', async () => {

    const mockUserAtualizar: Usuario = {
      id: '3',
      nome: 'Carlos Pereira',
      login: 'carlos.pereira',
      email: 'carlos.pereira@example.com',
      permissao: $Enums.Permissao.ADM,
      status: true,
      avatar: 'avatar3.png',
      ultimoLogin: new Date('2025-03-24T12:00:00Z'),
      criadoEm: new Date('2025-03-01T12:00:00Z'),
      atualizadoEm: new Date('2025-03-24T12:00:00Z'),
    };


    const updateParams: UpdateUsuarioDto = {
      login: 'carlaoperereira',
      avatar: 'avatar5.png',
      permissao: mockUserAtualizar.permissao
    }

    const mockUserAtualizado: Usuario = {
      id: '3',
      nome: 'Carlos Pereira',
      login: 'carlaopereira',
      email: 'carlos.pereira@example.com',
      permissao: $Enums.Permissao.ADM,
      status: true,
      avatar: 'avatar5.png',
      ultimoLogin: new Date('2025-03-24T12:00:00Z'),
      criadoEm: new Date('2025-03-01T12:00:00Z'),
      atualizadoEm: new Date('2025-03-24T12:00:00Z'),
    };

    jest.spyOn(service, 'buscarPorId').mockResolvedValue(mockUserAtualizar);
    jest.spyOn(service, 'buscarPorLogin').mockResolvedValue(null);
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUserAtualizar);
    jest.spyOn(service, 'validaPermissaoCriador').mockReturnValue(mockUserAtualizar.permissao);
    (prisma.usuario.update as jest.Mock).mockResolvedValue(mockUserAtualizado);

    const result = await service.atualizar(mockUserAtualizar, mockUserAtualizar.id, updateParams);

    expect(result).not.toBe(null)
    expect(result).toEqual(mockUserAtualizado)

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: {
        id: expect.any(String),
      },
      data: updateParams
    })
  })

  //excluir usuario

  it('deve excluir um usuário', async () => {

    const mockExcUser: UsuarioResponseDTO = {
      id: '123456',
      nome: 'João da Silva',
      nomeSocial: 'João',
      login: 'joao.silva',
      email: 'joao.silva@example.com',
      status: true,
      avatar: 'https://example.com/avatar.jpg',
      permissao: $Enums.Permissao.ADM,
      ultimoLogin: new Date('2025-03-25T12:00:00Z'),
      criadoEm: new Date('2023-01-01T00:00:00Z'),
      atualizadoEm: new Date('2025-03-25T12:00:00Z')
    };

    (prisma.usuario.update as jest.Mock).mockResolvedValue({ desativado: true })

    const result = await service.excluir(mockExcUser.id)

    expect(result).not.toBe(null)
    expect(result).toEqual({ desativado: true })

    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: {
        id: expect.any(String)
      },
      data: { status: false },
    })


  })

  //autorizar usuario

  it('deverá autorizar um usuario', async () => {

    const mockAutUser: UsuarioResponseDTO = {
      id: '123456',
      nome: 'João da Silva',
      nomeSocial: 'João',
      login: 'joao.silva',
      email: 'joao.silva@example.com',
      status: true,
      avatar: 'https://example.com/avatar.jpg',
      permissao: $Enums.Permissao.ADM,
      ultimoLogin: new Date('2025-03-25T12:00:00Z'),
      criadoEm: new Date('2023-01-01T00:00:00Z'),
      atualizadoEm: new Date('2025-03-25T12:00:00Z')
    };

    (prisma.usuario.update as jest.Mock).mockResolvedValue(mockAutUser)

    const result = await service.autorizaUsuario(mockAutUser.id)

    expect(result).not.toBe(null)
    expect(result).toEqual({ autorizado: true })
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: mockAutUser.id },
      data: { status: true },
    })

  })

  //validar usuario

  it('deve validar um usuario', async () => {
    const mockValidUser: UsuarioResponseDTO = {
      id: '123456',
      nome: 'João da Silva',
      nomeSocial: 'João',
      login: 'joao.silva',
      email: 'joao.silva@example.com',
      status: true,
      avatar: 'https://example.com/avatar.jpg',
      permissao: $Enums.Permissao.ADM,
      ultimoLogin: new Date('2025-03-25T12:00:00Z'),
      criadoEm: new Date('2023-01-01T00:00:00Z'),
      atualizadoEm: new Date('2025-03-25T12:00:00Z')
    };

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockValidUser);

    const result = await service.validaUsuario(mockValidUser.id)

    expect(result).not.toBe(null)
    expect(result).toEqual(mockValidUser)
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: {
        id: expect.any(String)
      }
    })

  })


});
