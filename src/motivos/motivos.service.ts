import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMotivoDto } from './dto/create-motivo.dto';
import { UpdateMotivoDto } from './dto/update-motivo.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Motivo } from '@prisma/client';

@Injectable()
export class MotivosService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
  ) {}
  
  async buscarPorTexto(texto: string): Promise<Motivo> {
    const motivo: Motivo = await this.prisma.motivo.findFirst({ where: { texto }});
    return motivo;
  }

  async criar(createMotivoDto: CreateMotivoDto): Promise<Motivo> {
    const { texto } = createMotivoDto;
    if (await this.buscarPorTexto(texto)) throw new BadRequestException('Motivo já cadastrado');
    const motivo: Motivo = await this.prisma.motivo.create({ data: createMotivoDto });
    if (!motivo) throw new InternalServerErrorException('Não foi possível criar o motivo');
    return motivo;
  }

  async listaCompleta(): Promise<Motivo[]> {
    const motivos: Motivo[] = await this.prisma.motivo.findMany({ where: { status: true }, orderBy: { texto: 'asc' }});
    if (!motivos) return [];
    return motivos;
  }

  async buscarTudo(
    pagina: number = 1,
    limite: number = 10,
    status?: string,
    busca?: string
  ): Promise<{ total: number, pagina: number, limite: number, data: Motivo[] }> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca && { OR: [
        { texto: { contains: busca }},
      ]}),
      ...(status && status !== '' && { 
        status: status === 'ATIVO' ? true : (status === 'INATIVO' ? false : undefined) 
      }),
    };
    const total: number = await this.prisma.motivo.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const motivos: Motivo[] = await this.prisma.motivo.findMany({
      where: searchParams,
      orderBy: { texto: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite
    });
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: motivos
    };
  }

  async buscarPorId(id: string): Promise<Motivo> {
    if (!id || id === '') throw new BadRequestException('ID vazio.');
    const motivo: Motivo = await this.prisma.motivo.findUnique({ where: { id }});
    if (!motivo) throw new BadRequestException('Motivo não encontrado.');
    return motivo;
  }

  async atualizar(id: string, updateMotivoDto: UpdateMotivoDto): Promise<Motivo> {
    await this.buscarPorId(id);
    const { texto } = updateMotivoDto;
    if (texto && texto !== ''){
      const textoExiste = await this.buscarPorTexto(texto);
      if (textoExiste && textoExiste.id !== id) throw new BadRequestException('Motivo já cadastrado');
    }
    const motivoAtualizado: Motivo = await this.prisma.motivo.update({ where: { id }, data: updateMotivoDto });
    if (!motivoAtualizado) throw new InternalServerErrorException('Não foi possível atualizar o motivo');
    return motivoAtualizado;
  }

  async desativar(id: string): Promise<{ desativado: boolean }> {
    await this.buscarPorId(id);
    const motivoDesativado = await this.prisma.motivo.update({ where: { id }, data: { status: false }});
    if (!motivoDesativado || motivoDesativado.status === true) throw new InternalServerErrorException('Não foi possível desativar o motivo');
    return { desativado: true };
  }
}
