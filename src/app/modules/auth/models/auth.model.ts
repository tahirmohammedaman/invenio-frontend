export class AuthModel {
  authToken: string;
  refreshToken: string;
  expiresIn: Date | null;
  displayName: string;
  displayImage: string;
  email: string;
  role: string;

  setAuth(auth: AuthModel) {
    this.authToken = auth.authToken;
    this.refreshToken = auth.refreshToken;
    this.expiresIn = auth.expiresIn;
    this.displayName= auth.displayName;
    this.displayImage = auth.displayImage;
    this.email = auth.email;
    this.role = auth.role;
  }
}

export class LoginResponse {
  Token: string;
  DisplayName: string;
  Email: string;
  DisplayImage: string;
  Role: string;
}