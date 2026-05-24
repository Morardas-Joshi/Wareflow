import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // Check if SKU exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new ConflictException(`Product with SKU ${createProductDto.sku} already exists.`);
    }

    // Verify category
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${createProductDto.categoryId} not found.`);
    }

    return this.prisma.product.create({
      data: createProductDto,
      include: {
        category: {
          select: { name: true }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        inventory: {
          select: {
            quantityAvailable: true,
            warehouse: { select: { name: true } }
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: {
          include: { warehouse: true, zone: true }
        }
      }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    return product;
  }
}
