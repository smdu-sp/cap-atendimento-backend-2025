import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MotivosService } from './motivos.service';
import { CreateMotivoDto } from './dto/create-motivo.dto';
import { UpdateMotivoDto } from './dto/update-motivo.dto';

@Controller('motivos')
export class MotivosController {
  constructor(private readonly motivosService: MotivosService) {}

  @Permissoes('ADM')
  @Post('criar')
  criar(@Body() createMotivoDto: CreateMotivoDto) {
    return this.motivosService.criar(createMotivoDto);
  }

  @Get('lista-completa')
  listaCompleta() {
    return this.motivosService.listaCompleta();
  }

  @Get('buscar-tudo')
  buscarTudo(
    @Query('pagina')  pagina?: string,
    @Query('limite')  limite?: string,
    @Query('status')  status?: string,
    @Query('busca')   busca?:  string
  ) {
    return this.motivosService.buscarTudo(+pagina, +limite, status, busca);
  }

  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.motivosService.buscarPorId(id);
  }

  @Permissoes('ADM')
  @Patch('atualizar/:id')
  atualizar(@Param('id') id: string, @Body() updateMotivoDto: UpdateMotivoDto) {
    return this.motivosService.atualizar(id, updateMotivoDto);
  }

  @Permissoes('ADM')
  @Delete('desativar/:id')
  desativar(@Param('id') id: string) {
    return this.motivosService.desativar(id);
  }
}
