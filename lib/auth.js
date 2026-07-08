import { verifyJWT } from './utils';

export const getAuthenticatedUser = (request) => {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = verifyJWT(token);
        return decoded.userId;
    } catch (error) {
        return null;
    }
};
