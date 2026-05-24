import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalesOrderLineDto {
  @ApiProperty({ example: 'prod-uuid-12345' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  quantityOrdered: number;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 0.0 })
  @IsNumber()
  @IsOptional()
  discount?: number;
}

export class CreateSalesOrderDto {
  @ApiProperty({ example: 'cust-uuid-12345' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional({ example: '2026-05-20T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  orderDate?: string;

  @ApiPropertyOptional({ example: '2026-05-25T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  deliveryDate?: string;

  @ApiPropertyOptional({ example: 10.0 })
  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @ApiPropertyOptional({ example: 8.25 })
  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @ApiPropertyOptional({ example: '123 Customer Way, Austin, TX' })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiPropertyOptional({ example: '123 Customer Way, Austin, TX' })
  @IsString()
  @IsOptional()
  billingAddress?: string;

  @ApiPropertyOptional({ example: 'Deliver during business hours.' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [CreateSalesOrderLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderLineDto)
  lines: CreateSalesOrderLineDto[];
}
