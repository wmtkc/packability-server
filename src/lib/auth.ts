import jwt from 'jsonwebtoken';
import { User } from '@src/models/User';
import { ReqRes, Context } from './types/Context';

export const createAccessToken = (user: User) => {
    return jwt.sign({userId: user.id, email: user.email}, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: process.env.ACCESS_TOKEN_TTL_MINS + 'm'
    });
}

export const createRefreshToken = (user: User) => {
    return jwt.sign({userId: user.id, email: user.email}, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: '7d'
    })
}

export const auth = ( { req, res }: ReqRes ): Context => {
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