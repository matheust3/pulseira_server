import { MockProxy, mock } from 'jest-mock-extended'
import { SendEmailTokenUseCase } from './send-email-token-use-case'
import { EmailProvider } from '../../../application/gateways/email-provider'
import { EmailToken } from '../../models/email-token'

describe('send-email-token-use-case.test.ts - execute', () => {
  let sut: SendEmailTokenUseCase
  let emailProviderSpy: MockProxy<EmailProvider>
  let emailToken: MockProxy<EmailToken>

  beforeEach(() => {
    emailToken = mock<EmailToken>()
    emailProviderSpy = mock<EmailProvider>()
    sut = new SendEmailTokenUseCase(emailProviderSpy)
  })

  test('ensure send email with token', async () => {
    //! Arrange
    emailToken = mock<EmailToken>({ email: 'any_email', token: 'token' })
    //! Act
    await sut.execute(emailToken)
    //! Assert
    expect(emailProviderSpy.sendEmail).toHaveBeenCalledWith(
      'any_email',
      'Your crm token',
      'Your crm token is: token',
      'Your crm token is: <b>token</b>',
    )
  })
})
