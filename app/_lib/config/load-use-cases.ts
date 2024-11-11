import { AuthWithEmailOnly } from '../core/domain/usecases/authentication/auth-with-email-only'
import { SignWithEmailOnly } from '../core/domain/usecases/authentication/sign-with-email-only'
import { CreateEmailTokenUseCase } from '../core/domain/usecases/email-token/create-email-token-use-case'
import { SendEmailTokenUseCase } from '../core/domain/usecases/email-token/send-email-token-use-case'
import { VerifyEmailTokenUseCase } from '../core/domain/usecases/email-token/verify-email-token-use-case'
import { EmailTokenRepository } from '../core/application/gateways/email-token-repository'
import { EmailProvider } from '../core/application/gateways/email-provider'
import { JwtService } from '../core/application/gateways/jwt-service'
import { GetAccountStatus } from '../core/domain/usecases/account/get-account-status'
import { AccountRepository } from '../core/application/gateways/account-repository'
import { CreateUser } from '../core/domain/usecases/user/create-user'
import { UserRepository } from '../core/application/gateways/user-repository'
import { GetEmailFromToken } from '../core/domain/usecases/authentication/get-email-from-token'
import { GetTokenPayload } from '../core/domain/usecases/authentication/get-token-payload'
import { UpdateUser } from '../core/domain/usecases/user/update-user'
import { SaveImage } from '../core/domain/usecases/images/save-image'
import { ImageRepository } from '../core/application/gateways/image-repository'
import { GetUserById } from '../core/domain/usecases/user/get-user-by-id'
import { DeleteImage } from '../core/domain/usecases/images/delete-image'
import { ReorderImages } from '../core/domain/usecases/images/reorder-images'
import { SaveLocation } from '../core/domain/usecases/location/save-location'
import { LocationRepository } from '../core/application/gateways/location-repository'
import { GetCandidates } from '../core/domain/usecases/interaction/get-candidates'
import { InteractionRepository } from '../core/application/gateways/interaction-repository'

export class LoadUseCases {
  private readonly _createEmailTokenUseCase: CreateEmailTokenUseCase
  public get createEmailTokenUseCase(): CreateEmailTokenUseCase {
    return this._createEmailTokenUseCase
  }

  private readonly _createUserUseCase: CreateUser
  public get createUserUseCase(): CreateUser {
    return this._createUserUseCase
  }

  private readonly _deleteImageUseCase: DeleteImage
  public get deleteImageUseCase(): DeleteImage {
    return this._deleteImageUseCase
  }

  private readonly _verifyEmailTokenUseCase: VerifyEmailTokenUseCase
  public get verifyEmailTokenUseCase(): VerifyEmailTokenUseCase {
    return this._verifyEmailTokenUseCase
  }

  private readonly _sendEmailTokenUseCase: SendEmailTokenUseCase
  public get sendEmailTokenUseCase(): SendEmailTokenUseCase {
    return this._sendEmailTokenUseCase
  }

  private readonly _signWithEmailOnly: SignWithEmailOnly
  public get signWithEmailOnly(): SignWithEmailOnly {
    return this._signWithEmailOnly
  }

  private readonly _authWithEmailOnly: AuthWithEmailOnly
  public get authWithEmailOnly(): AuthWithEmailOnly {
    return this._authWithEmailOnly
  }

  private readonly _getAccountStatusUseCase: GetAccountStatus
  public get getAccountStatusUseCase(): GetAccountStatus {
    return this._getAccountStatusUseCase
  }

  private readonly _getCandidatesUseCase: GetCandidates
  public get getCandidatesUseCase(): GetCandidates {
    return this._getCandidatesUseCase
  }

  private readonly _getEmailFromTokenUseCase: GetEmailFromToken
  public get getEmailFromTokenUseCase(): GetEmailFromToken {
    return this._getEmailFromTokenUseCase
  }

  private readonly _getTokenPayloadUseCase: GetTokenPayload
  public get getTokenPayloadUseCase(): GetTokenPayload {
    return this._getTokenPayloadUseCase
  }

  private readonly _getUserByIdUseCase: GetUserById
  public get getUserByIdUseCase(): GetUserById {
    return this._getUserByIdUseCase
  }

  private readonly _updateUserUseCase: UpdateUser
  public get updateUserUseCase(): UpdateUser {
    return this._updateUserUseCase
  }

  private readonly _reorderImagesUseCase: ReorderImages
  public get reorderImagesUseCase(): ReorderImages {
    return this._reorderImagesUseCase
  }

  private readonly _saveImageUseCase: SaveImage
  public get saveImageUseCase(): SaveImage {
    return this._saveImageUseCase
  }

  private readonly _saveLocationUseCase: SaveLocation
  public get saveLocationUseCase(): SaveLocation {
    return this._saveLocationUseCase
  }

  constructor(args: {
    accountRepository: AccountRepository
    emailTokenRepository: EmailTokenRepository
    emailProvider: EmailProvider
    imageRepository: ImageRepository
    interactionRepository: InteractionRepository
    jwtService: JwtService
    locationRepository: LocationRepository
    userRepository: UserRepository
  }) {
    // - C
    this._createEmailTokenUseCase = new CreateEmailTokenUseCase(
      args.emailTokenRepository,
    )
    this._createUserUseCase = new CreateUser({
      userRepository: args.userRepository,
    })
    // - D
    this._deleteImageUseCase = new DeleteImage({
      imageRepository: args.imageRepository,
    })
    this._verifyEmailTokenUseCase = new VerifyEmailTokenUseCase(
      args.emailTokenRepository,
    )
    this._getEmailFromTokenUseCase = new GetEmailFromToken({
      emailTokenRepository: args.emailTokenRepository,
      jwtService: args.jwtService,
    })

    this._sendEmailTokenUseCase = new SendEmailTokenUseCase(args.emailProvider)
    this._signWithEmailOnly = new SignWithEmailOnly(args.jwtService)
    this._authWithEmailOnly = new AuthWithEmailOnly({
      jwtService: args.jwtService,
      emailTokenRepository: args.emailTokenRepository,
      userRepository: args.userRepository,
    })

    this._getAccountStatusUseCase = new GetAccountStatus({
      jwtService: args.jwtService,
      accountRepository: args.accountRepository,
    })

    this._getCandidatesUseCase = new GetCandidates({
      interactionRepository: args.interactionRepository,
    })

    this._updateUserUseCase = new UpdateUser({
      userRepository: args.userRepository,
    })

    this._getTokenPayloadUseCase = new GetTokenPayload()
    this._getUserByIdUseCase = new GetUserById({
      userRepository: args.userRepository,
    })

    this._reorderImagesUseCase = new ReorderImages({
      imageRepository: args.imageRepository,
    })

    this._saveImageUseCase = new SaveImage({
      imageRepository: args.imageRepository,
    })

    this._saveLocationUseCase = new SaveLocation({
      locationRepository: args.locationRepository,
    })
  }
}
