import jwt from 'jsonwebtoken';
import { User } from '@src/models/User';
import { Request, Response } from 'express';
import { Context } from './types/Context';

export const createAccessToken = (user: User) => {
    return jwt.sign({userId: user.id, email: user.email}, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: process.env.ACCESS_TOKEN_TTL_MINS + 'm'
    });
}

export const createRefreshToken = (user: User) => {
    return jwt.sign({userId: user.id, email: user.email}, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: process.env.REFRESH_TOKEN_TTL_DAYS + 'd'
    })
}

export const setRefreshTokenCookie = (res: Response, user: User) => {
    res.cookie(process.env.REFRESH_TOKEN_COOKIE!, createRefreshToken(user), {httpOnly: true});
}

export const auth = (req: Request, res: Response): Context => {
    let context = { req, res }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return { ...context, isAuth: false }; 
    } 

    const token = authHeader.split(' ')[1];
    if (!token || token === '') {
        return { ...context, isAuth: false };
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    } catch (err) {
        return { ...context, isAuth: false };
    }

    if (!payload || typeof(payload) === 'string') {
        return { ...context, isAuth: false };
    }

    return {
        ...context,
        isAuth: true,
        payload: payload as any,
    }
}

export const validateRefresh = async (req: Request, res: Response) => {
    const token = req.cookies.refresh;
    if (!token) return res.send({ ok: false, accessToken: '' })

    let payload: any = null;
    try {
        payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!)
    } catch (err) {
        console.error(err)
        return res.send({ ok: false, accessToken: '' })
    }

    const user = await User.findOne({ id: payload.userId })

    if (!user) {
        return res.send({ ok: false, accessToken: '' }) 
    }

    setRefreshTokenCookie(res, user);
    return res.send({ ok: true, accessToken: createAccessToken(user)})
  }