import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PARTIAL_RECEIPT = 'PARTIAL_RECEIPT',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional({ enum: PurchaseOrderStatus, example: 'APPROVED' })
  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Expected delivery date adjustment' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: '2026-05-30T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  expectedDate?: string;
}
