import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseOrderLineDto {
  @ApiProperty({ example: 'prod-uuid-12345' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantityOrdered: number;

  @ApiProperty({ example: 45.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 'vendor-uuid-12345' })
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiPropertyOptional({ example: '2026-05-20T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  orderDate?: string;

  @ApiPropertyOptional({ example: '2026-05-27T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  expectedDate?: string;

  @ApiPropertyOptional({ example: 15.0 })
  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @ApiPropertyOptional({ example: 'Standard raw material supply' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'Payment terms Net 30' })
  @IsString()
  @IsOptional()
  terms?: string;

  @ApiProperty({ type: [CreatePurchaseOrderLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderLineDto)
  lines: CreatePurchaseOrderLineDto[];
}
