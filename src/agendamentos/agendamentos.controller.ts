import { Controller, Get, Post, Patch, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { ImportICSDto } from './dto/importICS.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { AgendamentosInterceptor } from './interceptors/agendamentos.interceptor';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) { }

  @Permissoes('ADM')
  @Post('criar')
  criar(@Body() createAgendamentoDto: CreateAgendamentoDto) {
    return this.agendamentosService.criar(createAgendamentoDto);
  }

  @Get('lista-completa')
  listaCompleta() {
    return this.agendamentosService.listaCompleta();
  }

  // @Get('hoje')
  // agendaDiaria(
  //   @Query('busca') busca?:  string
  // ) {
  //   return this.agendamentosService.agendaDiaria(busca);
  // }

  @Get('buscar-tudo')
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string,
    @Query('tecnico') tecnico?: string,
    @Query('motivoId') motivoId?: string,
    @Query('coordenadoriaId') coordenadoriaId?: string,
    @Query('status') status?: string,
    @Query('periodo') periodo?: string
  ) {
    return this.agendamentosService.buscarTudo(+pagina, +limite, busca, tecnico, motivoId, coordenadoriaId, status, periodo);
  }

  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.agendamentosService.buscarPorId(id);
  }

  @Patch('atualizar/:id')
  atualizar(
    @Param('id') id: string,
    @Body() updateAgendamentoDto: Partial<CreateAgendamentoDto>
  ) {
    return this.agendamentosService.atualizar(id, updateAgendamentoDto);
  }

  @ApiBody({ description: 'arquivo de extensão .ics para importação de dados', type: ImportICSDto })
  @ApiConsumes('multipart/form-data')
  @Post('importar')
  @UseInterceptors(AgendamentosInterceptor)
  async importarICS(@UploadedFile() arquivo: Express.Multer.File) {
    return await this.agendamentosService.importarICS(arquivo);
  }

  @Get('dashboard')
  @UseInterceptors(AgendamentosInterceptor)
  async dashboard(
    @Query('motivoId') motivoId?: string,
    @Query('coordenadoriaId') coordenadoriaId?: string,
    @Query('periodo') periodo?: string
  ) {
    return await this.agendamentosService.dashboard(motivoId, coordenadoriaId, periodo);
  }
}

