export class AuthModel {
  token: string;
  refreshToken: string;
  jwtExpirationInSec: Number;

  setAuth(auth: AuthModel) {
    this.token = auth.token;
    this.refreshToken = auth.refreshToken;
    this.jwtExpirationInSec = auth.jwtExpirationInSec;
  }
}
