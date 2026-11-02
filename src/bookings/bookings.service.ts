import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FieldsService } from '../fields/fields.service';
@Injectable()
export class BookingsService {
  private readonly bookings: any[] = [];
  private nextId = 1;
  constructor(private readonly fields: FieldsService) {}
  private validate(body: any) {
    const { fieldId, date, startTime, endTime, customerName, userId } =
      body || {};
    if (
      !Number.isInteger(Number(fieldId)) ||
      !date ||
      !startTime ||
      !endTime ||
      !customerName
    )
      throw new BadRequestException({
        success: false,
        message:
          'fieldId, date, startTime, endTime, dan customerName wajib diisi',
      });
    if (
      typeof date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(date + 'T00:00:00'))
    ) {
      throw new BadRequestException({
        success: false,
        message: 'date harus berformat YYYY-MM-DD',
      });
    }
    const pattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (
      !pattern.test(startTime) ||
      !pattern.test(endTime) ||
      startTime >= endTime
    ) {
      throw new BadRequestException({
        success: false,
        message: 'Jam harus HH:mm dan endTime setelah startTime',
      });
    }
    return {
      fieldId: Number(fieldId),
      date,
      startTime,
      endTime,
      customerName: String(customerName).trim(),
      userId: userId ? String(userId) : 'guest',
    };
  }
  create(body: any) {
    const input = this.validate(body);
    const field = this.fields.findOne(input.fieldId).data;
    if (field.status !== 'ACTIVE')
      throw new ConflictException({
        success: false,
        message: 'Lapangan tidak tersedia untuk dipesan',
      });
    const conflict = this.bookings.find(
      (b) =>
        b.fieldId === input.fieldId &&
        b.date === input.date &&
        b.status === 'BOOKED' &&
        b.startTime < input.endTime &&
        b.endTime > input.startTime,
    );
    if (conflict)
      throw new ConflictException({
        success: false,
        message: 'Jadwal bentrok dengan reservasi lain',
        conflictBookingId: conflict.id,
      });
    const booking = {
      id: this.nextId++,
      ...input,
      status: 'BOOKED',
      createdAt: new Date().toISOString(),
    };
    this.bookings.push(booking);
    this.fields['bookings'] = this.bookings;
    return {
      success: true,
      message: 'Reservasi berhasil dibuat',
      data: booking,
    };
  }
  findOne(id: number) {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking)
      throw new NotFoundException({
        success: false,
        message: `Booking dengan id ${id} tidak ditemukan`,
      });
    return { success: true, data: booking };
  }
  findByUser(userId: string) {
    return {
      success: true,
      data: this.bookings.filter((b) => b.userId === userId),
    };
  }
  cancel(id: number) {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking)
      throw new NotFoundException({
        success: false,
        message: `Booking dengan id ${id} tidak ditemukan`,
      });
    if (booking.status !== 'BOOKED')
      throw new ConflictException({
        success: false,
        message: 'Reservasi sudah dibatalkan atau telah selesai',
      });
    booking.status = 'CANCELLED';
    return {
      success: true,
      message: 'Reservasi berhasil dibatalkan',
      data: booking,
    };
  }
}
