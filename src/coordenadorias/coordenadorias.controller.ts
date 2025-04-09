import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CoordenadoriasService } from './coordenadorias.service';
import { CreateCoordenadoriaDto } from './dto/create-coordenadoria.dto';
import { UpdateCoordenadoriaDto } from './dto/update-coordenadoria.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';

@Controller('coordenadorias')
export class CoordenadoriasController {
  constructor(private readonly coordenadoriasService: CoordenadoriasService) {}

  @Permissoes('ADM')
  @Post('criar')
  criar(@Body() createCoordenadoriaDto: CreateCoordenadoriaDto) {
    return this.coordenadoriasService.criar(createCoordenadoriaDto);
  }

  @Get('lista-completa')
  listaCompleta() {
    return this.coordenadoriasService.listaCompleta();
  }

  @Get('buscar-tudo')
  buscarTudo(
    @Query('pagina')  pagina?: string,
    @Query('limite')  limite?: string,
    @Query('status')  status?: string,
    @Query('busca')   busca?:  string
  ) {
    return this.coordenadoriasService.buscarTudo(+pagina, +limite, status, busca);
  }

  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.coordenadoriasService.buscarPorId(id);
  }

  @Permissoes('ADM')
  @Patch('atualizar/:id')
  atualizar(@Param('id') id: string, @Body() updateCoordenadoriaDto: UpdateCoordenadoriaDto) {
    return this.coordenadoriasService.atualizar(id, updateCoordenadoriaDto);
  }

  @Permissoes('ADM')
  @Delete('desativar/:id')
  desativar(@Param('id') id: string) {
    return this.coordenadoriasService.desativar(id);
  }
}
