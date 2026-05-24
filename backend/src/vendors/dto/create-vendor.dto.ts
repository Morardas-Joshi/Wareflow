import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ example: 'Global Supply Co.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'orders@globalsupply.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1-800-555-0144' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Global Supply Inc.' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ example: 'VAT-987654321' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'Primary raw material supplier' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: '500 Logistics Blvd' })
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiPropertyOptional({ example: 'Dock 4' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'Chicago' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'IL' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '60666' })
  @IsString()
  @IsOptional()
  postalCode?: string;
}
