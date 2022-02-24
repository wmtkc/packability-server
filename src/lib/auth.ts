import jwt from 'jsonwebtoken';

type request = {
    req: any
}

export default ( { req }: request ) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return { isAuth: false }; 
    } 

    const token = authHeader.split(' ')[1];
    if (!token || token === '') {
        return { isAuth: false };
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'SECRET');
    } catch (err) {
        return { isAuth: false };
    }

    if (!decodedToken || typeof(decodedToken) === 'string') {
        return { isAuth: false };
    }

    return {
        isAuth: true,
        userId: decodedToken.userId
    }
}