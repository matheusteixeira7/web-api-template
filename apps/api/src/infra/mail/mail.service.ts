import { Resend } from 'resend';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface MailServiceConfig {
  resendApiKey: string;
  mailFrom: string;
  frontendUrl: string;
}

export class MailService {
  private resend: Resend;
  private from: string;
  private frontendUrl: string;

  constructor(private readonly config: MailServiceConfig) {
    this.resend = new Resend(config.resendApiKey);
    this.from = config.mailFrom;
    this.frontendUrl = config.frontendUrl;
  }

  async send({ to, subject, html }: SendEmailOptions) {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    await this.send({
      to,
      subject: 'Verifique seu email',
      html: `
        <h1>Verificação de Email</h1>
        <p>Clique no link abaixo para verificar seu email:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>Este link expira em 24 horas.</p>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    await this.send({
      to,
      subject: 'Recuperação de Senha',
      html: `
        <h1>Recuperação de Senha</h1>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou a recuperação de senha, ignore este email.</p>
      `,
    });
  }
}
