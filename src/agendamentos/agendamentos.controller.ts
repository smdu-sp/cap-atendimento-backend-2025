import { Controller, Get, Post, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { AgendamentosInterceptor } from './interceptors/agendamentos.interceptor';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Permissoes('ADM')
  @Post('criar')
  criar(@Body() createAgendamentoDto: CreateAgendamentoDto) {
    return this.agendamentosService.criar(createAgendamentoDto);
  }

  @Get('lista-completa')
  listaCompleta() {
    return this.agendamentosService.listaCompleta();
  }

  @Get('buscar-tudo')
  buscarTudo(
      @Query('pagina')  pagina?: string,
      @Query('limite')  limite?: string,
      @Query('busca')   busca?:  string
  ) {
    return this.agendamentosService.buscarTudo(+pagina, +limite, busca);
  }

  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.agendamentosService.buscarPorId(id);
  }

  @IsPublic()
  @Post('importar')
  @UseInterceptors(AgendamentosInterceptor)
  async importarICS(@UploadedFile() arquivo: Express.Multer.File) {
    return await this.agendamentosService.importarICS(arquivo);
  }
  
  @IsPublic()
  @Get('dashboard')
  @UseInterceptors(AgendamentosInterceptor)
  async dashboard(
    @Query('motivoId') motivoId?: string,
    @Query('coordenadoriaId') coordenadoriaId?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return await this.agendamentosService.dashboard(motivoId, coordenadoriaId, dataInicio, dataFim);
  }
}

