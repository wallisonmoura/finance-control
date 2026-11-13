export interface ChangePasswordOutput {
  // A new login for the device that changed the password: the change signs
  // out every login issued before it, this device's included.
  accessToken: string;
}
