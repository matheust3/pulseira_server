import { Resend } from "resend";
import { ResendEmailProvider } from "../infra/gateways/resend-email-provider";

export class LoadGateways {
  private readonly _emailProvider: ResendEmailProvider;
  public get emailProvider(): ResendEmailProvider {
    return this._emailProvider;
  }

  constructor(args: { emailProvider: Resend }) {
    // Load gateways
    this._emailProvider = new ResendEmailProvider(args.emailProvider);
  }
}
