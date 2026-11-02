import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
@Injectable()
export class FieldsService {
  private readonly fields = [
    {
      id: 1,
      name: 'Lapangan Futsal A',
      sportType: 'FUTSAL',
      pricePerHour: 150000,
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Lapangan Badminton 1',
      sportType: 'BADMINTON',
      pricePerHour: 75000,
      status: 'ACTIVE',
    },
    {
      id: 3,
      name: 'Lapangan Basket',
      sportType: 'BASKET',
      pricePerHour: 125000,
      status: 'INACTIVE',
    },
  ];
  findAll() {
    return { success: true, data: this.fields };
  }
  findOne(id: number) {
    const field = this.fields.find((x) => x.id === id);
    if (!field)
      throw new NotFoundException({
        success: false,
        message: `Lapangan dengan id ${id} tidak ditemukan`,
      });
    return { success: true, data: field };
  }
  availability(id: number, date: string) {
    const field = this.fields.find((x) => x.id === id);
    if (!field)
      throw new NotFoundException({
        success: false,
        message: `Lapangan dengan id ${id} tidak ditemukan`,
      });
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException({
        success: false,
        message: 'Query date wajib berformat YYYY-MM-DD',
      });
    }
    const bookedSlots = this.bookings
      .filter(
        (b) => b.fieldId === id && b.date === date && b.status === 'BOOKED',
      )
      .map((b) => ({
        bookingId: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
      }));
    return {
      success: true,
      data: {
        fieldId: id,
        date,
        fieldStatus: field.status,
        available: field.status === 'ACTIVE',
        bookedSlots,
      },
    };
  }
  private bookings: any[] = [];
  setBookingsReader(reader: () => any[]) {
    this.bookings = reader();
  }
}
