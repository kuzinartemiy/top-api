import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { IdValidationPipe } from 'src/pipes/id-validation.pipe';
import { CreateTopPageDto } from './dto/create-top-page.dto';
import { FindTopPageDto } from './dto/find-top-page.dto';
import { TOP_PAGE_NOT_FOUND_ERROR } from './top-page.constants';
import { TopPageService } from './top-page.service';
import { HhService } from 'src/hh/hh.service';

@Controller('top-page')
export class TopPageController {
  constructor(
    private readonly topPageService: TopPageService,
    private readonly hhService: HhService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() dto: CreateTopPageDto) {
    return this.topPageService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id', IdValidationPipe) id: string) {
    const topPage = await this.topPageService.findById(id);
    if (!topPage) throw new NotFoundException(TOP_PAGE_NOT_FOUND_ERROR);
    return topPage;
  }

  @Get('byAlias/:alias')
  async geTbyAlias(@Param('alias') alias: string) {
    const topPage = await this.topPageService.findByAlias(alias);
    if (!topPage) throw new NotFoundException(TOP_PAGE_NOT_FOUND_ERROR);
    return topPage;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', IdValidationPipe) id: string) {
    const deletedTopPage = await this.topPageService.deleteById(id);
    if (!deletedTopPage) throw new NotFoundException(TOP_PAGE_NOT_FOUND_ERROR);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async patch(
    @Param('id', IdValidationPipe) id: string,
    @Body() dto: CreateTopPageDto,
  ) {
    const updatedTopPage = await this.topPageService.updateById(id, dto);
    if (!updatedTopPage) throw new NotFoundException(TOP_PAGE_NOT_FOUND_ERROR);
    return updatedTopPage;
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('find')
  async find(@Body() { firstCategory }: FindTopPageDto) {
    return this.topPageService.findByCategory(firstCategory);
  }

  @Get('textSearch/:text')
  async textSearch(@Param('text') text: string) {
    return this.topPageService.findByText(text);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async test() {
    const data = await this.topPageService.findForHhUpdate(new Date());
    for (const page of data) {
      const hhData = await this.hhService.getData(page.category);
      page.hh = hhData;
      await this.topPageService.updateById(page._id, page);
    }
  }
}
