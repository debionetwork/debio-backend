export interface UserInterface {
  id: string;
  email: string;
  username: string;
  address: string;
}

export interface TokenInterface {
  accessToken: string;
}

export interface AuthUserInterface {
  user: UserInterface;
  token: TokenInterface;
}
