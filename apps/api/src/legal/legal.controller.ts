import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LegalService } from './legal.service';
import {
  CreateLegalDocumentDto,
  UpdateLegalDocumentDto,
  RecordConsentDto,
  BulkConsentDto,
  CookieConsentDto,
} from './dto/legal.dto';
import { Public, Roles, CurrentUser } from '../common/decorators';
import { PaginationDto } from '../common/dto';
import { Request } from 'express';

@ApiTags('Legal')
@Controller('legal')
export class LegalController {
  constructor(private readonly service: LegalService) {}

  // ── Public document endpoints ──────────────────────────────────────────

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get('document/:type')
  findByType(@Param('type') type: string) {
    return this.service.findByType(type);
  }

  // ── Consent endpoints (authenticated) ──────────────────────────────────

  @ApiBearerAuth()
  @Post('consent')
  recordConsent(
    @CurrentUser('id') userId: string,
    @Body() dto: RecordConsentDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent: string,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '0.0.0.0';
    return this.service.recordConsent(userId, dto.documentId, ip, userAgent || '');
  }

  @ApiBearerAuth()
  @Post('consent/bulk')
  recordBulkConsent(
    @CurrentUser('id') userId: string,
    @Body() dto: BulkConsentDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent: string,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '0.0.0.0';
    return this.service.recordBulkConsent(userId, dto.documentIds, ip, userAgent || '');
  }

  @ApiBearerAuth()
  @Get('consent')
  getUserConsents(@CurrentUser('id') userId: string) {
    return this.service.getUserConsents(userId);
  }

  @ApiBearerAuth()
  @Get('consent/pending')
  getPendingConsents(@CurrentUser('id') userId: string) {
    return this.service.getPendingConsents(userId);
  }

  // ── Cookie consent (public) ────────────────────────────────────────────

  @Public()
  @Post('cookie-consent')
  recordCookieConsent(
    @Body() dto: CookieConsentDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent: string,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '0.0.0.0';
    return this.service.recordCookieConsent({
      userId: dto.userId,
      sessionId: dto.sessionId,
      essential: true,
      analytics: dto.analytics ?? false,
      marketing: dto.marketing ?? false,
      ipAddress: ip,
      userAgent: userAgent || '',
    });
  }

  // ── Admin document CRUD ────────────────────────────────────────────────

  @ApiBearerAuth()
  @Get('admin/all')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  adminFindAll() {
    return this.service.adminFindAll();
  }

  @ApiBearerAuth()
  @Get('admin/consents')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'documentType', required: false })
  adminGetConsentAudit(
    @Query() query: PaginationDto,
    @Query('userId') userId?: string,
    @Query('documentType') documentType?: string,
  ) {
    return this.service.adminGetConsentAudit({ ...query, userId, documentType });
  }

  @ApiBearerAuth()
  @Post()
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  create(@Body() dto: CreateLegalDocumentDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateLegalDocumentDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
