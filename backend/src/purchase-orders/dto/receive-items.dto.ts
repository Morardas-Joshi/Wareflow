import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReceiveItemLineDto {
  @ApiProperty({ example: 'prod-uuid-12345' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  quantityReceived: number;
}

export class ReceiveItemsDto {
  @ApiProperty({ example: 'wh-uuid-12345' })
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ type: [ReceiveItemLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveItemLineDto)
  items: ReceiveItemLineDto[];
}
