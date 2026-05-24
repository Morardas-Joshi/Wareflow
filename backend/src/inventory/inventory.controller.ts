import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('warehouses')
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully.' })
  createWarehouse(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.inventoryService.createWarehouse(createWarehouseDto);
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'Get all warehouses' })
  findAllWarehouses() {
    return this.inventoryService.findAllWarehouses();
  }

  @Get('warehouses/:id')
  @ApiOperation({ summary: 'Get warehouse details by ID' })
  @ApiResponse({ status: 404, description: 'Warehouse not found.' })
  findWarehouseById(@Param('id') id: string) {
    return this.inventoryService.findWarehouseById(id);
  }

  @Get('levels')
  @ApiOperation({ summary: 'Get inventory levels across all warehouses' })
  getInventoryLevels() {
    return this.inventoryService.getInventoryLevels();
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Manually adjust product inventory level' })
  adjustInventory(@Body() adjustDto: AdjustInventoryDto) {
    return this.inventoryService.adjustInventory(adjustDto);
  }

  @Post('transfers')
  @ApiOperation({ summary: 'Create a stock transfer between warehouses' })
  createStockTransfer(@Body() createDto: CreateStockTransferDto, @Request() req: any) {
    // req.user is populated by JwtAuthGuard
    return this.inventoryService.createStockTransfer(createDto, req.user.userId);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get all stock transfers' })
  findAllStockTransfers() {
    return this.inventoryService.findAllStockTransfers();
  }
}
