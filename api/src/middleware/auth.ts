
import { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        account?: Account;
        teamId?: string;
    }
}

const bypassCheckRoutes = [
    { method: 'POST', path: '/accounts' },
    { method: 'POST', path: '/simulation/start' },
];



export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const cert = req.socket.getPeerCertificate();

    if (!cert || !cert.raw) {
        res.status(403).json({ error: 'Tls certificate is required' });
        return;
    }

    try {
        const organizationUnit = cert.subject.OU;
        if (!organizationUnit) {
            res.status(403).json({ error: 'Organization unit is required in the certificate' });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({
            error: 'Certificate processing failed',
            details: (error as Error).message
        });
    }
}