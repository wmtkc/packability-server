import { User } from '@models/User'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export type AuthData = {
    isAuth: boolean
    payload?: {
        userId: string
    }
}

const createRefreshToken = (user: User) => {
    return jwt.sign(
        { userId: user.id, tokenVersion: user.tokenVersion },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: process.env.REFRESH_TOKEN_TTL_DAYS + 'd',
        },
    )
}

/**
 * Create an access token
 * @param user the current user
 * @returns JWT access token
 */
export const createAccessToken = (user: User): string => {
    return jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: process.env.ACCESS_TOKEN_TTL_MINS + 'm',
    })
}

/**
 * Set Refresh token on response
 * @param res server response
 * @param user the current user, leave undefined to set empty token
 */
export const setRefreshTokenCookie = (res: Response, user?: User) => {
    let token = ''
    if (user) token = createRefreshToken(user)
    res.cookie(process.env.REFRESH_TOKEN_COOKIE!, token, {
        httpOnly: true,
        path: '/refresh_token',
    })
}

/**
 * Authenticate and set context
 * @param req Apollo request object
 * @returns AuthData object
 */
export const isAuth = (req: Request): AuthData => {
    const authHeader = req.headers?.authorization ?? null
    if (!authHeader) {
        return { isAuth: false }
    }

    const token = authHeader.split(' ')[1]
    if (!token || token === '') {
        return { isAuth: false }
    }

    let payload
    try {
        payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!)
    } catch (err) {
        return { isAuth: false }
    }

    if (!payload || typeof payload === 'string') {
        return { isAuth: false }
    }

    return {
        isAuth: true,
        payload: payload as any,
    }
}

/**
 * Authenticate request using refresh token and set new access token
 * @param req server request
 * @param res server response
 * @returns send response
 */
export const validateRefresh = async (req: Request, res: Response) => {
    const token = req.cookies.refresh
    if (!token) return res.send({ ok: false, accessToken: '' })

    let payload: any = null
    try {
        payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!)
    } catch (err) {
        console.error(err)
        return res.send({ ok: false, accessToken: '' })
    }

    const user = await User.findById(payload.userId)

    if (!user) {
        return res.send({ ok: false, accessToken: '' })
    }

    if (user.tokenVersion !== payload.tokenVersion) {
        return res.send({ ok: false, accessToken: '' })
    }

    setRefreshTokenCookie(res, user)
    return res.send({ ok: true, accessToken: createAccessToken(user) })
}
