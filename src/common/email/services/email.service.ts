import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
    attachments?: Array<{
        filename: string;
        content?: string | Buffer;
        contentType?: string;
    }>;
}

@Injectable()
export class EmailService implements OnModuleDestroy {
    private readonly logger = new Logger(EmailService.name);
    private transporter: Transporter | null = null;

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('email.host');
        const port = this.configService.get<number>('email.port');
        const secure = this.configService.get<boolean>('email.secure');
        const user = this.configService.get<string>('email.user');
        const pass = this.configService.get<string>('email.pass');

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: user && pass ? { user, pass } : undefined,
        });
    }

    async onModuleDestroy(): Promise<void> {
        if (this.transporter) {
            this.transporter.close();
            this.transporter = null;
        }
    }

    /**
     * Send an email.
     * @returns MessageId on success, null when sending is skipped (e.g. no SMTP configured)
     */
    async send(options: SendMailOptions): Promise<string | null> {
        if (!this.transporter) {
            this.logger.warn('Email transporter not available, skip sending');
            return null;
        }

        const from = this.configService.get<string>('email.from');
        const to = Array.isArray(options.to)
            ? options.to.join(', ')
            : options.to;

        try {
            const info = await this.transporter.sendMail({
                from,
                to,
                subject: options.subject,
                text: options.text,
                html: options.html,
                cc: options.cc,
                bcc: options.bcc,
                replyTo: options.replyTo,
                attachments: options.attachments,
            });
            this.logger.debug(`Email sent: ${info.messageId} to ${to}`);
            return info.messageId;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            const code = err && typeof err === 'object' && 'code' in err ? (err as { code?: string }).code : undefined;
            const response = err && typeof err === 'object' && 'response' in err ? (err as { response?: string }).response : undefined;
            this.logger.error(
                `Failed to send email to ${to}: ${message}${code ? ` (code: ${code})` : ''}${response ? ` response: ${response}` : ''}`
            );
            throw err;
        }
    }
}
