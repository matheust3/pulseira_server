export interface EmailProvider {
  /**
   * Sends an email.
   * @param to - The email address to send the email to.
   * @param subject - The subject of the email.
   * @param text - The text content of the email.
   * @param html - The HTML content of the email.
   * @returns A promise that resolves when the email is sent.
   * @throws An error if the email could not be sent.
   */
  sendEmail(to: string, subject: string, text: string, html: string): Promise<void>;
}
