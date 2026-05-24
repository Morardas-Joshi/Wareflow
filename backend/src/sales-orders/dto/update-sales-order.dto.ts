import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SalesOrderStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export class UpdateSalesOrderDto {
  @ApiPropertyOptional({ enum: SalesOrderStatus, example: 'CONFIRMED' })
  @IsEnum(SalesOrderStatus)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Updated delivery instructions' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: '2026-05-28T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  deliveryDate?: string;
}
