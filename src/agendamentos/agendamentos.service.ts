
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Agendamento, Coordenadoria, Motivo, StatusAgendamento } from '@prisma/client';
import * as ical from 'node-ical';
import * as fs from 'fs';

@Injectable()
export class AgendamentosService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
  ) {}

  async listaCompleta(): Promise<Agendamento[]> {
    const agendamentos: Agendamento[] = await this.prisma.agendamento.findMany({ orderBy: { dataInicio: 'asc' }});
    if (!agendamentos) return [];
    return agendamentos;
  }

  async agendaDiaria(
    busca?: string
  ): Promise<Agendamento[]> {
    const data = new Date();
    const gte = new Date(
      data.getFullYear(),
      data.getMonth(),
      data.getDate(),
      0,
      0,
      0
    );
    const lte = new Date(
      data.getFullYear(),
      data.getMonth(),
      data.getDate(),
      23,
      59,
      59
    );
    const agendamentos: Agendamento[] = await this.prisma.agendamento.findMany({
      where: { 
        dataInicio: { gte, lte },
        ...(busca && busca !== '' && { 
          OR: [
            { resumo: { contains: busca }}, 
            { municipe: { contains: busca }},
            { processo: { contains: busca }},
            { rg: { contains: busca }},
            { cpf: { contains: busca }}
          ]
        })
      },
      orderBy: { dataInicio: 'asc' }
    });
    if (!agendamentos) return [];
    return agendamentos;
  }
  
  async criar(createAgendamentoDto: CreateAgendamentoDto): Promise<Agendamento> {
    const { motivoId, coordenadoriaId, tecnicoId } = createAgendamentoDto;
    const motivo: Motivo = await this.prisma.motivo.findFirst({ where: { id: motivoId }});
    if (!motivo) throw new BadRequestException('Motivo não encontrado');
    const coordenadoria: Coordenadoria = await this.prisma.coordenadoria.findFirst({ where: { id: coordenadoriaId }});
    if (!coordenadoria) throw new BadRequestException('Coordenadoria não encontrada');
    const tecnico = await this.prisma.usuario.findFirst({ where: { id: tecnicoId }});
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
    busca?: string,
    tecnico?: string,
    motivoId?: string,
    coordenadoriaId?: string,
    status?: string,
    periodo?: string
  ): Promise<{ total: number, pagina: number, limite: number, data: Agendamento[] }> {
    let gte: Date, lte: Date;
    if(periodo && periodo !== ''){
      const datas = periodo.split(',');
      if (datas.length === 1) datas.push(datas[0]);
      [gte, lte] = this.app.verificaData(datas[0], datas[1]);
    }
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca && { OR: [
        { municipe: { contains: busca }},
        { rg: { contains: busca }},
        { cpf: { contains: busca }},
        { processo: { contains: busca }},
      ]}),
      ...(tecnico && { tecnico: {
        OR: [
          { nome: { contains: tecnico }},
          { login: { contains: tecnico }}
        ]
      }}),
      ...(motivoId && motivoId !== 'all' && { motivoId: motivoId }),
      ...(coordenadoriaId && coordenadoriaId !== 'all' && { coordenadoriaId: coordenadoriaId }),
      ...(gte && lte && {
        dataInicio: { gte, lte }
      }),
      ...(status && status !== '' && { status: StatusAgendamento[status] }),
    };
    const total: number = await this.prisma.agendamento.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const agendamentos: Agendamento[] = await this.prisma.agendamento.findMany({
      where: searchParams,
      include: { motivo: true, coordenadoria: true, tecnico: true },
      orderBy: { dataInicio: 'desc' },
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

  async atualizar(id: string, updateAgendamentoDto: Partial<CreateAgendamentoDto>): Promise<Agendamento> {
    await this.buscarPorId(id);
    const agendamento = await this.prisma.agendamento.update({ where: { id }, data: updateAgendamentoDto });
    if (!agendamento) throw new InternalServerErrorException('Não foi possível atualizar o agendamento.');
    return agendamento;
  }

  async importarICS(arquivo: Express.Multer.File) {
    if (!arquivo) throw new BadRequestException('Nenhum arquivo enviado.');
    const { path } = arquivo;
    const events = Object.values(ical.sync.parseFile(path));
    // loop through events and log them
    const novosAgendamentos: { resumo: string, dataInicio: Date, dataFim: Date, importado: boolean, legado: boolean, coordenadoriaId: string, motivoId: string }[] = [];
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
        const repetido = novosAgendamentos.find((agendamento) => {
          return agendamento.resumo === resumo 
          && agendamento.dataInicio.getTime() === dataInicio.getTime() 
          && agendamento.dataFim.getTime() === dataFim.getTime()
        });
        if (repetido || resumo.toLowerCase().includes('cancelado')) continue;
        novosAgendamentos.push({
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
    fs.unlink(path, (err) => { if (err) console.log(err)});
    // return agendamentos.length;
    try {
      const [ enviados, duplicados ] = await this.prisma.$transaction(async (prisma) => {
        const enviados = await prisma.agendamento.createMany({ data: novosAgendamentos });
        const duplicados: { id: string }[] = await prisma.$queryRawUnsafe('SELECT id FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY resumo, dataInicio, dataFim ORDER BY id) AS number FROM agendamentos) t WHERE number > 1;');
        await prisma.$queryRawUnsafe('DELETE FROM agendamentos WHERE id IN(SELECT id FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY resumo, dataInicio, dataFim ORDER BY id) AS number FROM agendamentos) t WHERE number > 1);');
        return [ enviados.count, duplicados.length || 0 ];
      })
      const agendamentos = enviados > duplicados ? enviados - duplicados : 0;
      return { agendamentos, duplicados };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao importar agendamentos.');
    }
  }

  async dashboard(
    motivoId?: string,
    coordenadoriaId?: string,
    periodo?: string,
  ) {
    let gte: Date, lte: Date;
    if(periodo && periodo !== ''){
      const datas = periodo.split(',');
      if (datas.length === 1) datas.push(datas[0]);
      [gte, lte] = this.app.verificaData(datas[0], datas[1]);
    }
    const agendamentosFiltrados = await this.prisma.agendamento.findMany({
      where: {
        dataInicio: { gte, lte },
        ...(motivoId && motivoId !== 'all' && motivoId !== '' && { motivoId }),
        ...(coordenadoriaId && coordenadoriaId !== 'all' && coordenadoriaId !== '' && { coordenadoriaId })
      },
      include: { motivo: true, coordenadoria: true, tecnico: true },
    });
    const coordenadorias = await this.reduceCoordenadorias(agendamentosFiltrados);
    const motivos = await this.reduceMotivos(agendamentosFiltrados);

    const agendamentos = await this.prisma.agendamento.findMany();
    const totalAno = agendamentos.filter((agendamento) => agendamento.dataInicio >= new Date(new Date().getFullYear(), 0, 1)).length;
    const totalMes = agendamentos.filter((agendamento) =>
      agendamento.dataInicio.getMonth() === new Date().getMonth() &&
      agendamento.dataInicio.getFullYear() === new Date().getFullYear()
    ).length;
    const totalDia = agendamentos.filter((agendamento) =>
      agendamento.dataInicio.getDate() === new Date().getDate() &&
      agendamento.dataInicio.getMonth() === new Date().getMonth() &&
      agendamento.dataInicio.getFullYear() === new Date().getFullYear()
    ).length;

    const agendamentosMes: { label: string; value: number }[] = [];
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    for (let i = 0; i <= mesAtual+1; i++) {
      const chamadosMes = agendamentosFiltrados.filter((agendamento) => {
        const mes = new Date(agendamento.dataInicio).getMonth();
        const ano = new Date(agendamento.dataInicio).getFullYear();
        return mes === i && ano === anoAtual;
      });
      agendamentosMes.push({ label: `${meses[i]}/${anoAtual}`, value: chamadosMes.length });
    }
    return {
      coordenadorias,
      motivos,
      agendamentosMes,
      total: agendamentosFiltrados.length,
      totalAno,
      totalMes,
      totalDia
    }
  }

  async reduceCoordenadorias(agendamentos) {
    const coordenadorias = await this.prisma.coordenadoria.findMany();
    const coordenadoriasKV = coordenadorias.reduce((acc, cur) => ({ ...acc, [cur.sigla]: 0 }), {});
    for (const agendamento of agendamentos) {
      if (agendamento.coordenadoria)
        coordenadoriasKV[agendamento.coordenadoria.sigla] += 1;
    }
    const coordenadoriasArr = [];
    Object.keys(coordenadoriasKV).map((label) => coordenadoriasKV[label] > 0 && (coordenadoriasArr.push({ label, value: coordenadoriasKV[label]})));
    return coordenadoriasArr;
  }

  async reduceMotivos(agendamentos) {
    const motivos = await this.prisma.motivo.findMany();
    const motivosKV = motivos.reduce((acc, cur) => ({ ...acc, [cur.texto]: 0 }), {});
    for (const agendamento of agendamentos) {
      if (agendamento.motivo)
        motivosKV[agendamento.motivo.texto] += 1;
    }
    const motivosArr = [];
    Object.keys(motivosKV).map((label) => motivosKV[label] > 0 && (motivosArr.push({ label, value: motivosKV[label]})));
    return motivosArr;
  }
}
