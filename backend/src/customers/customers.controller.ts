import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer successfully created.' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer successfully updated.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
