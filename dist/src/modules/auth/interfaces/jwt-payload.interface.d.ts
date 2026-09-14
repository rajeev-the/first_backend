export interface JwtPayload {
    sub: string;
    role: 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';
    sessionId: string;
    iat?: number;
    exp?: number;
}
