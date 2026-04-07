import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}

export class ReplyTicketDto {
  @IsString()
  message: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED'])
  status: string;
}
