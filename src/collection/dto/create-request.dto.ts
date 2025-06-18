import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  name: string;

  @IsString()
  method: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsObject()
  headers?: any;

  @IsOptional()
  @IsString()
  body?: string;

  @IsString()
  bodyType: string;

  @IsOptional()
  @IsString()
  preScript?: string;

  @IsOptional()
  @IsString()
  postScript?: string;

  @IsOptional()
  @IsString()
  tests?: string;

  @IsOptional()
  @IsObject()
  pathVariables?: any;
}
