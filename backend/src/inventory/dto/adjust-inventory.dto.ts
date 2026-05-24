import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdjustInventoryDto {
  @ApiProperty({ example: 'WH-UUID-12345' })
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ example: 'PROD-UUID-12345' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 50, description: 'The absolute new quantity on hand' })
  @IsNumber()
  @Min(0)
  quantityOnHand: number;

  @ApiPropertyOptional({ example: 'LOT-2026-05' })
  @IsString()
  @IsOptional()
  batchNumber?: string;
}
