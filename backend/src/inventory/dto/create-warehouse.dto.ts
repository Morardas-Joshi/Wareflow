import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'WH-001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Main Warehouse' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '123 Logistics Way, Austin, TX' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
