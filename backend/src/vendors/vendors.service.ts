import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async create(createVendorDto: CreateVendorDto) {
    return this.prisma.vendor.create({
      data: createVendorDto,
    });
  }

  async findAll() {
    return this.prisma.vendor.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          orderBy: { orderDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found.`);
    }

    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto) {
    await this.findOne(id); // Throws 404 if not found

    return this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.vendor.delete({
      where: { id },
    });
  }
}
