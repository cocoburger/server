import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsNumber,
  IsArray,
  IsObject,
  IsOptional,
  Matches,
} from 'class-validator';
import {
  Gender,
  TransportationType,
  AccommodationType,
} from '../../users/enums/user.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: '8글자 이상 입력해주세요' })
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$/, {
    message: '대소문자, 숫자, 특수문자를 하나 이상 포함해 주세요',
  })
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsArray()
  preferredLanguage?: string[];

  @IsOptional()
  @IsObject()
  travelPreferences?: {
    preferredDestinations: string[];
    transportationPreference: TransportationType;
    accommodationType: AccommodationType[];
  };
}
