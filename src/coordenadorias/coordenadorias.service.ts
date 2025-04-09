import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCoordenadoriaDto } from './dto/create-coordenadoria.dto';
import { UpdateCoordenadoriaDto } from './dto/update-coordenadoria.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Coordenadoria } from '@prisma/client';

@Injectable()
export class CoordenadoriasService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
  ) {}

  async buscarPorSigla(sigla: string): Promise<Coordenadoria> {
    const coordenadoria: Coordenadoria = await this.prisma.coordenadoria.findUnique({ where: { sigla } });
    return coordenadoria;
  }
  
  async criar(createCoordenadoriaDto: CreateCoordenadoriaDto): Promise<Coordenadoria> {
    const { sigla } = createCoordenadoriaDto;
    if (await this.buscarPorSigla(sigla)) throw new BadRequestException('Coordenadoria já cadastrada');
    const coordenadoria: Coordenadoria = await this.prisma.coordenadoria.create({ data: createCoordenadoriaDto });
    if (!coordenadoria) throw new InternalServerErrorException('Não foi possível criar a coordenadoria');
    return coordenadoria;
  }

  async listaCompleta(): Promise<Coordenadoria[]> {
    const coordenadorias: Coordenadoria[] = await this.prisma.coordenadoria.findMany({ where: { status: true }, orderBy: { sigla: 'asc' }});
    if (!coordenadorias) return [];
    return coordenadorias;
  }

  async buscarTudo(
    pagina: number = 1,
    limite: number = 10,
    status?: string,
    busca?: string
  ): Promise<{ total: number, pagina: number, limite: number, data: Coordenadoria[] }> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca && { OR: [
        { sigla: { contains: busca }},
      ]}),
      ...(status && status !== '' && { 
        status: status === 'ATIVO' ? true : (status === 'INATIVO' ? false : undefined) 
      }),
    };
    const total: number = await this.prisma.coordenadoria.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const coordenadorias: Coordenadoria[] = await this.prisma.coordenadoria.findMany({
      where: searchParams,
      orderBy: { sigla: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite,
      include: {
        agendamentos: {
          select: { id: true }
        }
      }
    });
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: coordenadorias
    };
  }

  async buscarPorId(id: string): Promise<Coordenadoria> {
    if (!id || id === '') throw new BadRequestException('ID vazio.');
    const coordenadoria: Coordenadoria = await this.prisma.coordenadoria.findUnique({ where: { id } });
    if (!coordenadoria) throw new BadRequestException('Coordenadoria não encontrada.');
    return coordenadoria;
  }

  async atualizar(id: string, updateCoordenadoriaDto: UpdateCoordenadoriaDto): Promise<Coordenadoria> {
    await this.buscarPorId(id);
    const { sigla } = updateCoordenadoriaDto;
    if (sigla && sigla !== '') {
      const siglaExiste = await this.buscarPorSigla(sigla);
      if (siglaExiste && siglaExiste.id !== id) throw new BadRequestException('Coordenadoria já cadastrada');
    }
    const coordenadoriaAtualizada = await this.prisma.coordenadoria.update({ where: { id }, data: updateCoordenadoriaDto });
    if (!coordenadoriaAtualizada) throw new InternalServerErrorException('Não foi possível atualizar a coordenadoria.');
    return coordenadoriaAtualizada;
  }

  async desativar(id: string): Promise<{ desativado: boolean }> {
    await this.buscarPorId(id);
    const coordenadoriaDesativada = await this.prisma.coordenadoria.update({ where: { id }, data: { status: false }});
    if (!coordenadoriaDesativada || coordenadoriaDesativada.status === true) throw new InternalServerErrorException('Não foi possível desativar a coordenadoria.');
    return { desativado: true };
  }
}
