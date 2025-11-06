import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsString, Matches, IsOptional } from 'class-validator';


export class RegisterDto {
  @IsNotEmpty({ message: 'Username is required.' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username!: string;

  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  // Regex for strong password (at least one uppercase, one lowercase, one number)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  password!: string;
}

// --------------------------------------------------
// 2. DTO للـ Login (تسجيل الدخول)
// --------------------------------------------------
export class LoginDto {
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  password!: string;
}

// --------------------------------------------------
// 3. DTO لـ Confirm Email (تأكيد الإيميل)
// --------------------------------------------------
export class ConfirmEmailDto {
  @IsNotEmpty({ message: 'Verification token/OTP is required.' })
  @IsString()
  // Note: Depending on the implementation, this could be a short OTP or a JWT token.
  token!: string; 
}

// --------------------------------------------------
// 4. DTO لـ Forgot Password (طلب إعادة التعيين)
// --------------------------------------------------
export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  email!: string;
}

// --------------------------------------------------
// 5. DTO لـ Reset Password (إعادة التعيين الفعلية)
// --------------------------------------------------
export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Reset token is missing.' })
  @IsString()
  token!: string;

  @IsNotEmpty({ message: 'New password is required.' })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long.' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  newPassword!: string;
}