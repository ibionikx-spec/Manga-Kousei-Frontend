interface CustomJwtPayload {
  id: number;
  fullName: string;
  email: string;
  roles: Role[];
  sub: string;
  iat: number;
  exp: number;
}
