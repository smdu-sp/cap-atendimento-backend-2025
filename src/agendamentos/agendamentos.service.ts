
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Agendamento, Coordenadoria, Motivo } from '@prisma/client';
import * as ical from 'node-ical'
import * as fs from 'fs';

@Injectable()
export class AgendamentosService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
  ) { }

  async listaCompleta(): Promise<Agendamento[]> {
    const agendamentos: Agendamento[] = await this.prisma.agendamento.findMany({ orderBy: { dataInicio: 'asc' } });
    if (!agendamentos) return [];
    return agendamentos;
  }

  async criar(createAgendamentoDto: CreateAgendamentoDto): Promise<Agendamento> {
    const { motivoId, coordenadoriaId, tecnicoId } = createAgendamentoDto;
    const motivo: Motivo = await this.prisma.motivo.findFirst({ where: { id: motivoId } });
    if (!motivo) throw new BadRequestException('Motivo não encontrado');
    const coordenadoria: Coordenadoria = await this.prisma.coordenadoria.findFirst({ where: { id: coordenadoriaId } });
    if (!coordenadoria) throw new BadRequestException('Coordenadoria não encontrada');
    const tecnico = await this.prisma.usuario.findFirst({ where: { id: tecnicoId } });
    if (!tecnico) throw new BadRequestException('Técnico não encontrado');
    const novoAgendamento = await this.prisma.agendamento.create({
      data: createAgendamentoDto
    });
    if (!novoAgendamento) throw new InternalServerErrorException('Não foi possível criar o agendamento');
    return novoAgendamento;
  }

  async buscarTudo(
    pagina: number = 1,
    limite: number = 10,
    busca?: string
  ): Promise<{ total: number, pagina: number, limite: number, data: Agendamento[] }> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca && {
        OR: [
          { municipe: { contains: busca } },
          { rg: { contains: busca } },
          { cpf: { contains: busca } }
        ]
      })
    };
    const total: number = await this.prisma.agendamento.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const agendamentos: Agendamento[] = await this.prisma.agendamento.findMany({
      where: searchParams,
      orderBy: { dataInicio: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite
    });
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: agendamentos
    };
  }

  async buscarPorId(id: string): Promise<Agendamento> {
    if (!id || id === '') throw new BadRequestException('ID vazio.');
    const agendamento = await this.prisma.agendamento.findUnique({ where: { id } });
    if (!agendamento) throw new BadRequestException('Agendamento não encontrado.');
    return agendamento;
  }

  async importarICS(arquivo: Express.Multer.File) {
    if (!arquivo) throw new BadRequestException('Nenhum arquivo enviado.');
    const { path } = arquivo;
    const events = Object.values(ical.sync.parseFile(path));
    // loop through events and log them
    const agendamentos: { resumo: string, dataInicio: Date, dataFim: Date, importado: boolean, legado: boolean, coordenadoriaId: string, motivoId: string }[] = [];
    const coordenadorias = await this.prisma.coordenadoria.findMany();
    const coordenadoriasKV = coordenadorias.reduce((acc, cur) => ({ ...acc, [cur.sigla]: cur.id }), {});
    const motivos = await this.prisma.motivo.findMany();
    const motivosKV = motivos.reduce((acc, cur) => ({ ...acc, [cur.texto]: cur.id }), {});
    const eventos = events.filter((event) => event.type === 'VEVENT');
    for (const evento of eventos) {
      if (evento.type === 'VEVENT') {
        let coordenadoriaId: string;
        let motivoId: string;
        for (const coordenadoria of coordenadorias) {
          if (evento.summary.toUpperCase().replace(/[^a-zA-Z]/g, '').includes(coordenadoria.sigla.toUpperCase().replace(/[^a-zA-Z]/g, ''))) {
            coordenadoriaId = coordenadoriasKV[coordenadoria.sigla];
            break;
          }
        }
        for (const motivo of motivos) {
          if (evento.summary.toUpperCase().replace(/[^a-zA-Z]/g, '').includes(motivo.texto.toUpperCase().replace(/[^a-zA-Z]/g, ''))) {
            motivoId = motivosKV[motivo.texto];
            break;
          }
        }
        const resumo = evento.summary;
        const dataInicio = new Date(evento.start);
        const dataFim = new Date(evento.end);
        agendamentos.push({
          resumo,
          dataInicio,
          dataFim,
          coordenadoriaId,
          motivoId,
          importado: true,
          legado: true
        });
      }
    };
    fs.unlink(path, (err) => { if (err) console.log(err) });
    // return agendamentos.length;
    const result = await this.prisma.agendamento.createMany({ data: agendamentos });
    const result2 = await this.prisma.$queryRawUnsafe('DELETE FROM agendamentos WHERE id IN(SELECT id FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY resumo, dataInicio, dataFim ORDER BY id) AS number FROM agendamentos) t WHERE number > 1);');
    console.log({ result, result2 });
    return result;
  }

  async buscar(busca: string) {
    // const agendamentos = await this.prisma.agendamento.findMany();
    // const coordenadorias = await this.reduceCoordenadorias(agendamentos);
    // const motivos = await this.reduceMotivos(agendamentos);
    // return { coordenadorias, motivos };
    const coordenadorias = await this.prisma.coordenadoria.findMany({
      select: { sigla: true, agendamentos: true }
    });
    const motivos = await this.prisma.motivo.findMany({
      select: { texto: true, agendamentos: true }
    });
    return {
      coordenadorias: coordenadorias.map((coordenadoria) => {
        return coordenadoria.agendamentos.length > 0 && {
          coordenadoria: coordenadoria.sigla,
          quantidade: coordenadoria.agendamentos.length
        }
      }),
      motivos: motivos.map((motivo) => {
        return motivo.agendamentos.length > 0 && {
          motivo: motivo.texto,
          quantidade: motivo.agendamentos.length
        }
      })
    }
  }

  async reduceCoordenadorias(agendamentos: Agendamento[]) {
    const coordenadorias = await this.prisma.coordenadoria.findMany();
    const coordenadoriasKV = coordenadorias.reduce((acc, cur) => ({ ...acc, [cur.sigla]: 0 }), {});
    coordenadoriasKV['Sem Coordenadoria informada e/ou Fora de Padrão'] = 0;
    agendamentos.map((agendamento) => {
      for (let i = 0; i < coordenadorias.length; i++) {
        if (agendamento.resumo.toUpperCase().replace(/[^a-zA-Z]/g, '').includes(coordenadorias[i].sigla.toUpperCase().replace(/[^a-zA-Z]/g, ''))) {
          coordenadoriasKV[coordenadorias[i].sigla]++;
          break;
        }
        if (i === coordenadorias.length - 1) coordenadoriasKV['Sem Coordenadoria informada e/ou Fora de Padrão']++;
      }
    })
    for (const key in coordenadoriasKV)
      if (coordenadoriasKV[key] === 0) delete coordenadoriasKV[key];
    return coordenadoriasKV;
  }


  async reduceMotivos(agendamentos: Agendamento[]) {
    const motivos = await this.prisma.motivo.findMany();
    const motivosKV = motivos.reduce((acc, cur) => ({ ...acc, [cur.texto]: 0 }), {});
    motivosKV['Sem Motivo informado e/ou Fora de Padrão'] = 0;
    agendamentos.map((agendamento) => {
      for (let i = 0; i < motivos.length; i++) {
        if (agendamento.resumo.toUpperCase().replace(/[^a-zA-Z]/g, '').includes(motivos[i].texto.toUpperCase().replace(/[^a-zA-Z]/g, ''))) {
          motivosKV[motivos[i].texto]++;
          break;
        }
        if (i === motivos.length - 1) motivosKV['Sem Motivo informado e/ou Fora de Padrão']++;
      }
    })
    for (const key in motivosKV) {
      if (motivosKV[key] === 0) delete motivosKV[key];
    }
    return motivosKV;
  }
  // async importar(arquivo: Express.Multer.File) {
  //   if (!arquivo) throw new BadRequestException('Nenhum arquivo enviado.');
  //   const { path } = arquivo;
  //   const results: Array<{
  //     municipe: string;
  //     tecnico: string;
  //     processo: string;
  //     coordenadoria_sigla: string;
  //     dataInicio: Date;
  //     dataFim: Date;
  //     motivo_texto: string;
  //     rg?: string;
  //     cpf?: string;
  //   }> = [];
  //   let isFirstRow = true;
  //   return new Promise((resolve, reject) => {
  //     fs.createReadStream(path)
  //       .pipe(csv({ separator: ';', headers: false }))
  //       .on('data', async (row) => {
  //         if (isFirstRow) {
  //           isFirstRow = false;
  //           return;
  //         }
  //         const dataInicio = parse(row[6], 'dd/MM/yyyy HH:mm:ss', new Date());
  //         const dataFim = parse(row[7], 'dd/MM/yyyy HH:mm:ss', new Date());
  //         const record = {
  //           municipe: row[3].trim(),
  //           tecnico: row[1].trim(),
  //           processo: row[5].trim(),
  //           coordenadoria_sigla: row[4].trim(),
  //           dataInicio,
  //           dataFim,
  //           motivo_texto: row[0].trim(),
  //           rg: row[2]?.trim() || '',
  //         };
  //         results.push(record);
  //       })
  //       .on('end', async () => {
  //         for (const i in results) {
  //           const achou = await this.prisma.agendamento.findFirst({
  //             where: { ...results[i] },
  //           });
  //           if (achou) results.splice(+i, 1);
  //         }
  //         const coordenadorias = await this.prisma.coordenadoria.findMany({ select: { sigla: true, id: true }});
  //         const motivos = await this.prisma.motivo.findMany({ select: { texto: true, id: true }});
  //         const coordenadoriasKV = coordenadorias.reduce((acc, cur) => ({ ...acc, [cur.sigla]: cur.id }), {});
  //         const motivosKV = motivos.reduce((acc, cur) => ({ ...acc, [cur.texto]: cur.id }), {});
  //         if (results.length > 0) {
  //           await this.prisma.agendamento.createMany({ data: 
  //             results.map((agendamento) => ({
  //               municipe: agendamento.municipe,
  //               tecnico: agendamento.tecnico,
  //               processo: agendamento.processo,
  //               dataInicio: agendamento.dataInicio,
  //               dataFim: agendamento.dataFim,
  //               rg: agendamento.rg || null,
  //               cpf: agendamento.cpf || null,
  //               motivoId: motivosKV[agendamento.motivo_texto],
  //               coordenadoriaId: coordenadoriasKV[agendamento.coordenadoria_sigla],
  //             }))
  //           });
  //         }
  //         fs.unlinkSync(path);
  //         resolve({
  //           message: `Foram inseridos ${results.length} novos registros.`,
  //         });
  //       })
  //       .on('error', (error) => reject(error));
  //   });
  // }
}
