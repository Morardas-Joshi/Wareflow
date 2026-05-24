import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'billing@acme.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1-555-0199' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Acme Inc.' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ example: 'TX-1234567' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({ example: 5000.0 })
  @IsNumber()
  @IsOptional()
  creditLimit?: number;

  @ApiPropertyOptional({ example: 'Standard customer with net 30 terms' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: '123 Business Rd' })
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiPropertyOptional({ example: 'Suite 400' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'Austin' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'TX' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '78701' })
  @IsString()
  @IsOptional()
  postalCode?: string;
}
