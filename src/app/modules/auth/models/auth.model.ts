export class AuthModel {
  authToken: string;
  refreshToken: string;
  expiresIn: Date | null;
  displayName: string;
  displayImage: string;

  setAuth(auth: AuthModel) {
    this.authToken = auth.authToken;
    this.refreshToken = auth.refreshToken;
    this.expiresIn = auth.expiresIn;
    this.displayName= auth.displayName;
    this.displayImage = auth.displayImage;
  }
}
