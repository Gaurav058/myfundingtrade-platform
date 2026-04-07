import { IsString, IsOptional, MaxLength, IsDateString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2) @Matches(/^[A-Z]{2}$/) country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) addressLine1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) addressLine2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) postalCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) timezone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) bio?: string;
}
