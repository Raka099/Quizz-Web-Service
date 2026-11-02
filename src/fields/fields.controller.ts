import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { FieldsService } from './fields.service';
@Controller('fields')
export class FieldsController {
  constructor(private readonly service: FieldsService) {}
  @Get() findAll() {
    return this.service.findAll();
  }
  @Get(':id/availability') availability(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string,
  ) {
    return this.service.availability(id, date);
  }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
