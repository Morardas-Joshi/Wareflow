import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceiveItemsDto } from './dto/receive-items.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase Order created successfully.' })
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto, @Request() req: any) {
    return this.purchaseOrdersService.create(createPurchaseOrderDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  findAll() {
    return this.purchaseOrdersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase order by ID' })
  @ApiResponse({ status: 404, description: 'Purchase Order not found.' })
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Purchase Order updated successfully.' })
  @ApiResponse({ status: 404, description: 'Purchase Order not found.' })
  update(@Param('id') id: string, @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    return this.purchaseOrdersService.update(id, updatePurchaseOrderDto);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Receive items from a purchase order into inventory' })
  @ApiResponse({ status: 200, description: 'Stock updated and items received.' })
  receiveItems(@Param('id') id: string, @Body() receiveDto: ReceiveItemsDto) {
    return this.purchaseOrdersService.receiveItems(id, receiveDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Purchase Order deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Purchase Order not found.' })
  remove(@Param('id') id: string) {
    return this.purchaseOrdersService.remove(id);
  }
}
