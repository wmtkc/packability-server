import { Request, Response } from 'express'

export interface ReqRes {
    req: Request
    res: Response
}

export interface Context {
    req: Request
    res: Response
    isAuth: boolean
    payload?: {
        userId: string
    }
}