import { Resend } from "resend";
import { EmailProvider } from "../../core/application/gateways/external/email-provider";

export class ResendEmailProvider implements EmailProvider {
  private readonly resend: Resend;

  constructor(resend: Resend) {
    this.resend = resend;
  }

  async sendEmail(to: string, subject: string, text: string, html: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: `crm <accounts@${process.env.COMMUNICATION_EMAIL_DOMAIN}>`,
      to,
      text,
      html,
      subject,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
