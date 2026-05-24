import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-1001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 'Premium Office Chair' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Ergonomic mesh office chair' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 120.00 })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiPropertyOptional({ example: 15.5 })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ example: 'pcs' })
  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  reorderLevel?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Category ID' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
