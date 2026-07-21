/** The shape of data embedded in a signed JWT and attached to `req.user`. */
export interface AuthUser {
  id: string;
  email: string;
}

/** A User record with the password hash stripped — safe to send to the client. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}