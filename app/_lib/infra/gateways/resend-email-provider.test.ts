import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { ResendEmailProvider } from "./resend-email-provider";
import { Resend } from "resend";

describe("resend-email-provider.test.ts - sendEmail", () => {
  let sut: ResendEmailProvider;
  let resendSpy: DeepMockProxy<Resend>;

  beforeAll(() => {
    process.env.COMMUNICATION_EMAIL_DOMAIN = "email.domain.com";
  });

  beforeEach(() => {
    resendSpy = mockDeep<Resend>();
    resendSpy.emails.send.mockResolvedValue({
      error: null,
    } as never);

    sut = new ResendEmailProvider(resendSpy);
  });

  test("ensure call resend with correct params", async () => {
    //! Arrange
    //! Act
    await sut.sendEmail("to", "subject", "text", "html");
    //! Assert
    expect(resendSpy.emails.send).toHaveBeenCalledWith({
      from: "crm <email.domain.com>",
      to: "to",
      text: "text",
      html: "html",
      subject: "subject",
    });
  });

  test("ensure throw error if resend return error", async () => {
    //! Arrange
    resendSpy.emails.send.mockResolvedValue({
      error: {
        message: "error",
      },
    } as never);
    //! Act
    const promise = sut.sendEmail("to", "subject", "text", "html");
    //! Assert
    await expect(promise).rejects.toThrow("error");
  });
});
