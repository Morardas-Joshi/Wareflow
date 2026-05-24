import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceiveItemsDto } from './dto/receive-items.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePurchaseOrderDto, userId: string) {
    const { vendorId, orderDate, expectedDate, taxAmount = 0, notes, terms, lines } = createDto;

    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found.`);
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

      const lineUnitPrice = line.unitPrice || Number(product.costPrice);
      const lineTotalPrice = lineUnitPrice * line.quantityOrdered;

      subtotal += lineTotalPrice;

      orderLinesData.push({
        productId: line.productId,
        quantityOrdered: line.quantityOrdered,
        quantityReceived: 0,
        unitPrice: new Decimal(lineUnitPrice),
        totalPrice: new Decimal(lineTotalPrice),
      });
    }

    const totalAmount = subtotal + taxAmount;

    // Generate unique PO number
    const poNumber = `PO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        status: 'DRAFT',
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        vendorId,
        createdById: userId,
        subtotal: new Decimal(subtotal),
        taxAmount: new Decimal(taxAmount),
        totalAmount: new Decimal(totalAmount),
        notes,
        terms,
        lines: {
          create: orderLinesData,
        },
      },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.purchaseOrder.findMany({
      include: {
        vendor: { select: { name: true, company: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found.`);
    }

    return order;
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto) {
    await this.findOne(id); // Check exists

    const updatedData: any = {};
    if (updateDto.notes !== undefined) updatedData.notes = updateDto.notes;
    if (updateDto.expectedDate !== undefined) updatedData.expectedDate = updateDto.expectedDate ? new Date(updateDto.expectedDate) : null;
    if (updateDto.status !== undefined) updatedData.status = updateDto.status;

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: updatedData,
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async receiveItems(id: string, receiveDto: ReceiveItemsDto) {
    const { warehouseId, items } = receiveDto;

    // Verify PO and warehouse exist
    const order = await this.findOne(id);
    if (order.status === 'DRAFT' || order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot receive items for draft or cancelled purchase orders. Approve the order first.');
    }

    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${warehouseId} not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Process each received item
      for (const item of items) {
        const line = order.lines.find((l) => l.productId === item.productId);
        if (!line) {
          throw new BadRequestException(`Product ${item.productId} is not part of this purchase order.`);
        }

        const remainingToReceive = line.quantityOrdered - line.quantityReceived;
        if (item.quantityReceived > remainingToReceive) {
          throw new BadRequestException(
            `Received quantity (${item.quantityReceived}) exceeds remaining ordered quantity (${remainingToReceive}) for product ${line.product.name}.`,
          );
        }

        // 1. Update purchase order line received count
        await tx.purchaseOrderLine.update({
          where: { id: line.id },
          data: {
            quantityReceived: {
              increment: item.quantityReceived,
            },
          },
        });

        // 2. Increment stock level in the selected warehouse (Upsert inventory)
        await tx.inventory.upsert({
          where: {
            productId_warehouseId_batchNumber: {
              productId: item.productId,
              warehouseId,
              batchNumber: 'DEFAULT',
            },
          },
          update: {
            quantityOnHand: { increment: item.quantityReceived },
            quantityAvailable: { increment: item.quantityReceived },
          },
          create: {
            productId: item.productId,
            warehouseId,
            batchNumber: 'DEFAULT',
            quantityOnHand: item.quantityReceived,
            quantityAvailable: item.quantityReceived,
          },
        });
      }

      // Refresh order data to check completion
      const updatedLines = await tx.purchaseOrderLine.findMany({
        where: { poId: id },
      });

      const totalOrdered = updatedLines.reduce((sum, l) => sum + l.quantityOrdered, 0);
      const totalReceived = updatedLines.reduce((sum, l) => sum + l.quantityReceived, 0);

      let newStatus = order.status;
      if (totalReceived >= totalOrdered) {
        newStatus = 'RECEIVED';
      } else if (totalReceived > 0) {
        newStatus = 'PARTIAL_RECEIPT';
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: { status: newStatus },
        include: {
          vendor: true,
          lines: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    if (order.status !== 'DRAFT' && order.status !== 'CANCELLED') {
      throw new BadRequestException('Only draft or cancelled purchase orders can be deleted.');
    }

    // Delete lines first
    await this.prisma.purchaseOrderLine.deleteMany({
      where: { poId: id },
    });

    return this.prisma.purchaseOrder.delete({
      where: { id },
    });
  }
}
