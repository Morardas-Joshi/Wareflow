import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product successfully created.' })
  @ApiResponse({ status: 409, description: 'SKU already exists.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
