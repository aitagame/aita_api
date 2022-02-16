import { Request } from "express";
import { User } from "src/api/users/user.model";

export interface ExpressRequestInterface extends Request {
    user?: User
}