import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId }
      });
      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${createCategoryDto.parentId} not found.`);
      }
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        children: true, // Includes one level of sub-categories
      }
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true,
      }
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }

    return category;
  }
}
