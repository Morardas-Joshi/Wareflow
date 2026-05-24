import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Vendors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor successfully created.' })
  create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  findAll() {
    return this.vendorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vendor by ID' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vendor by ID' })
  @ApiResponse({ status: 200, description: 'Vendor successfully updated.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.update(id, updateVendorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vendor by ID' })
  @ApiResponse({ status: 200, description: 'Vendor successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(id);
  }
}
