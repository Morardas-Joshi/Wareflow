import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Sales Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sales order' })
  @ApiResponse({ status: 201, description: 'Sales Order created successfully.' })
  create(@Body() createSalesOrderDto: CreateSalesOrderDto, @Request() req: any) {
    return this.salesOrdersService.create(createSalesOrderDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales orders' })
  findAll() {
    return this.salesOrdersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sales order by ID' })
  @ApiResponse({ status: 404, description: 'Sales Order not found.' })
  findOne(@Param('id') id: string) {
    return this.salesOrdersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sales order by ID' })
  @ApiResponse({ status: 200, description: 'Sales Order updated successfully.' })
  @ApiResponse({ status: 404, description: 'Sales Order not found.' })
  update(@Param('id') id: string, @Body() updateSalesOrderDto: UpdateSalesOrderDto) {
    return this.salesOrdersService.update(id, updateSalesOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sales order by ID' })
  @ApiResponse({ status: 200, description: 'Sales Order deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Sales Order not found.' })
  remove(@Param('id') id: string) {
    return this.salesOrdersService.remove(id);
  }
}
