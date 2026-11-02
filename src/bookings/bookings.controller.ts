import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
@Controller()
export class BookingsController {
  constructor(private readonly service: BookingsService) {}
  @Post('bookings') create(@Body() body: any) {
    return this.service.create(body);
  }
  @Get('bookings/:id') findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Get('users/:userId/bookings') findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }
  @Patch('bookings/:id/cancel') cancel(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancel(id);
  }
}
