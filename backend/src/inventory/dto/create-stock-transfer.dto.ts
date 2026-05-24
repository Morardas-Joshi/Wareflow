import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockTransferLineDto {
  @ApiProperty({ example: 'prod-uuid-12345' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateStockTransferDto {
  @ApiProperty({ example: 'WH-SRC-UUID' })
  @IsString()
  @IsNotEmpty()
  sourceId: string;

  @ApiProperty({ example: 'WH-DST-UUID' })
  @IsString()
  @IsNotEmpty()
  destinationId: string;

  @ApiPropertyOptional({ example: 'Transferring seasonal overflow stock' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [StockTransferLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferLineDto)
  lines: StockTransferLineDto[];
}
