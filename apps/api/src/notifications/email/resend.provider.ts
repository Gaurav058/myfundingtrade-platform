import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  EmailProvider,
  SendEmailOptions,
  SendEmailResult,
} from './email-provider.interface';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private readonly client: Resend | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.from = this.config.get<string>('EMAIL_FROM', 'MyFundingTrade <noreply@myfundingtrade.com>');

    if (apiKey) {
      this.client = new Resend(apiKey);
    } else {
      this.client = null;
      this.logger.warn('RESEND_API_KEY not set — emails will be logged only');
    }
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.client) {
      this.logger.log(`[DRY-RUN] Email to=${options.to} subject="${options.subject}"`);
      return { id: `dry-run-${Date.now()}`, success: true };
    }

    try {
      const { data, error } = await this.client.emails.send({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        tags: options.tags,
      });

      if (error) {
        this.logger.error(`Email failed to=${options.to}: ${error.message}`);
        return { id: '', success: false, error: error.message };
      }

      this.logger.log(`Email sent to=${options.to} id=${data?.id}`);
      return { id: data?.id ?? '', success: true };
    } catch (err: any) {
      this.logger.error(`Email error to=${options.to}: ${err.message}`);
      return { id: '', success: false, error: err.message };
    }
  }
}
