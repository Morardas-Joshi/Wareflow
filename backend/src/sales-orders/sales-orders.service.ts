import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SalesOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSalesOrderDto, userId: string) {
    const { customerId, orderDate, deliveryDate, discountAmount = 0, taxAmount = 0, shippingAddress, billingAddress, notes, lines } = createDto;

    // Verify customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found.`);
    }

    // Verify products exist and calculate prices
    let subtotal = 0;
    const orderLinesData = [];

    for (const line of lines) {
      const product = await this.prisma.product.findUnique({
        where: { id: line.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${line.productId} not found.`);
      }

      const lineUnitPrice = line.unitPrice || Number(product.unitPrice);
      const lineDiscount = line.discount || 0;
      const lineTotalPrice = (lineUnitPrice - lineDiscount) * line.quantityOrdered;

      subtotal += lineTotalPrice;

      orderLinesData.push({
        productId: line.productId,
        quantityOrdered: line.quantityOrdered,
        unitPrice: new Decimal(lineUnitPrice),
        discount: new Decimal(lineDiscount),
        totalPrice: new Decimal(lineTotalPrice),
      });
    }

    const totalAmount = subtotal - discountAmount + taxAmount;

    // Generate unique Sales Order number
    const soNumber = `SO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.salesOrder.create({
      data: {
        soNumber,
        status: 'DRAFT',
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        customerId,
        createdById: userId,
        subtotal: new Decimal(subtotal),
        discountAmount: new Decimal(discountAmount),
        taxAmount: new Decimal(taxAmount),
        totalAmount: new Decimal(totalAmount),
        shippingAddress,
        billingAddress,
        notes,
        lines: {
          create: orderLinesData,
        },
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.salesOrder.findMany({
      include: {
        customer: { select: { name: true, company: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Sales Order with ID ${id} not found.`);
    }

    return order;
  }

  async update(id: string, updateDto: UpdateSalesOrderDto) {
    const order = await this.findOne(id);

    const updatedData: any = {};
    if (updateDto.notes !== undefined) updatedData.notes = updateDto.notes;
    if (updateDto.deliveryDate !== undefined) updatedData.deliveryDate = updateDto.deliveryDate ? new Date(updateDto.deliveryDate) : null;
    
    if (updateDto.status !== undefined) {
      // Logic for stock deductions when order is confirmed/shipped
      if (updateDto.status === 'CONFIRMED' && order.status === 'DRAFT') {
        // Optional inventory checks or allocation
      }
      updatedData.status = updateDto.status;
    }

    return this.prisma.salesOrder.update({
      where: { id },
      data: updatedData,
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    if (order.status !== 'DRAFT' && order.status !== 'CANCELLED') {
      throw new BadRequestException('Only draft or cancelled orders can be deleted.');
    }

    // Delete lines first (Prisma handles relations, but since we don't have cascade delete configured in all settings, let's delete lines first)
    await this.prisma.salesOrderLine.deleteMany({
      where: { soId: id },
    });

    return this.prisma.salesOrder.delete({
      where: { id },
    });
  }
}
