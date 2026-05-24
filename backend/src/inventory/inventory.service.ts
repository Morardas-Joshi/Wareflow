import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // WAREHOUSE OPERATIONS
  // ==========================================

  async createWarehouse(createWarehouseDto: CreateWarehouseDto) {
    const existing = await this.prisma.warehouse.findUnique({
      where: { code: createWarehouseDto.code },
    });
    if (existing) {
      throw new BadRequestException(`Warehouse with code ${createWarehouseDto.code} already exists.`);
    }
    return this.prisma.warehouse.create({
      data: createWarehouseDto,
    });
  }

  async findAllWarehouses() {
    return this.prisma.warehouse.findMany({
      include: {
        _count: {
          select: { inventory: true },
        },
      },
    });
  }

  async findWarehouseById(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        zones: true,
        inventory: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found.`);
    }
    return warehouse;
  }

  // ==========================================
  // INVENTORY OPERATIONS
  // ==========================================

  async getInventoryLevels() {
    return this.prisma.inventory.findMany({
      include: {
        product: {
          select: { name: true, sku: true, unitPrice: true },
        },
        warehouse: {
          select: { name: true, code: true },
        },
        zone: {
          select: { name: true },
        },
      },
    });
  }

  async adjustInventory(adjustDto: AdjustInventoryDto) {
    const { warehouseId, productId, quantityOnHand, batchNumber } = adjustDto;

    // Verify product and warehouse exist
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product with ID ${productId} not found.`);

    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) throw new NotFoundException(`Warehouse with ID ${warehouseId} not found.`);

    const batch = batchNumber || 'DEFAULT';

    // Upsert inventory level
    return this.prisma.inventory.upsert({
      where: {
        productId_warehouseId_batchNumber: {
          productId,
          warehouseId,
          batchNumber: batch,
        },
      },
      update: {
        quantityOnHand,
        quantityAvailable: quantityOnHand, // assuming 0 allocated initially
      },
      create: {
        productId,
        warehouseId,
        batchNumber: batch,
        quantityOnHand,
        quantityAvailable: quantityOnHand,
      },
    });
  }

  // ==========================================
  // STOCK TRANSFER OPERATIONS
  // ==========================================

  async createStockTransfer(createDto: CreateStockTransferDto, userId: string) {
    const { sourceId, destinationId, notes, lines } = createDto;

    if (sourceId === destinationId) {
      throw new BadRequestException('Source and destination warehouses cannot be the same.');
    }

    // Verify warehouses exist
    const source = await this.prisma.warehouse.findUnique({ where: { id: sourceId } });
    if (!source) throw new NotFoundException(`Source warehouse not found.`);

    const destination = await this.prisma.warehouse.findUnique({ where: { id: destinationId } });
    if (!destination) throw new NotFoundException(`Destination warehouse not found.`);

    // Check stock availability in source warehouse
    for (const line of lines) {
      const inv = await this.prisma.inventory.findMany({
        where: {
          productId: line.productId,
          warehouseId: sourceId,
        },
      });
      const totalAvailable = inv.reduce((sum, item) => sum + item.quantityAvailable, 0);
      if (totalAvailable < line.quantity) {
        const prod = await this.prisma.product.findUnique({ where: { id: line.productId } });
        throw new BadRequestException(
          `Insufficient stock for product ${prod?.name || line.productId}. Available: ${totalAvailable}, Requested: ${line.quantity}`,
        );
      }
    }

    // Reference number generation
    const referenceNumber = `TR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Execute transfer inside database transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Create StockTransfer
      const transfer = await tx.stockTransfer.create({
        data: {
          referenceNumber,
          status: 'COMPLETED', // auto-complete for simple flow
          sourceId,
          destinationId,
          createdById: userId,
          notes,
          lines: {
            create: lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      // 2. Adjust inventories
      for (const line of lines) {
        // Find stock items in source (prioritizing items with inventory)
        const sourceInventoryItems = await tx.inventory.findMany({
          where: { productId: line.productId, warehouseId: sourceId },
          orderBy: { quantityAvailable: 'desc' },
        });

        let remainingToDeduct = line.quantity;
        for (const item of sourceInventoryItems) {
          if (remainingToDeduct <= 0) break;
          const deduct = Math.min(item.quantityAvailable, remainingToDeduct);
          
          await tx.inventory.update({
            where: { id: item.id },
            data: {
              quantityOnHand: item.quantityOnHand - deduct,
              quantityAvailable: item.quantityAvailable - deduct,
            },
          });
          remainingToDeduct -= deduct;
        }

        // Add stock items to destination
        const destInventoryItem = await tx.inventory.findFirst({
          where: { productId: line.productId, warehouseId: destinationId, batchNumber: 'DEFAULT' },
        });

        if (destInventoryItem) {
          await tx.inventory.update({
            where: { id: destInventoryItem.id },
            data: {
              quantityOnHand: destInventoryItem.quantityOnHand + line.quantity,
              quantityAvailable: destInventoryItem.quantityAvailable + line.quantity,
            },
          });
        } else {
          await tx.inventory.create({
            data: {
              productId: line.productId,
              warehouseId: destinationId,
              batchNumber: 'DEFAULT',
              quantityOnHand: line.quantity,
              quantityAvailable: line.quantity,
            },
          });
        }
      }

      return transfer;
    });
  }

  async findAllStockTransfers() {
    const transfers = await this.prisma.stockTransfer.findMany({
      include: {
        source: { select: { name: true, code: true } },
        destination: { select: { name: true, code: true } },
        createdBy: { select: { firstName: true, lastName: true } },
        lines: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const productIds = Array.from(new Set(transfers.flatMap(t => t.lines.map(l => l.productId))));
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    return transfers.map(t => ({
      ...t,
      lines: t.lines.map(l => ({
        ...l,
        product: productMap.get(l.productId) || { name: 'Unknown Product', sku: 'N/A' },
      })),
    }));
  }
}
