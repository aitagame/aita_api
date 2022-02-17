import { User } from "../user.model";

export type UserType = Omit<User, 'hashPassword'>;