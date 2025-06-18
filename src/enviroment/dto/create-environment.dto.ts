import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateEnvironmentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  variables: any;
}
