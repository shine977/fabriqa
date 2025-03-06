import { RequestUser } from "./user.interface";

import { Request as ExRequest } from 'express-serve-static-core'
declare global {
    namespace Express {
        interface Request {
            user: RequestUser
        }
    }
}

// declare module "express-serve-static-core" {
//     interface Request extends ExRequest {
//         user: RequestUser
//     }
// }