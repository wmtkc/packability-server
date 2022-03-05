import { Request, Response } from 'express'
import {isAuth, AuthData} from '@src/lib/auth';

type ReqRes = {
    req: Request
    res: Response
}

export type Context = ReqRes & AuthData

/**
 * GraphQL Request Context
 * Add any new request meta to this object
 * @param param0 Apollo Request Object
 * @returns Context object
 */
export const setContext = ({req, res}: {req: Request, res: Response}): Context => {
    const auth = isAuth(req);

    return {
        req,
        res,
        ...auth
    }
}