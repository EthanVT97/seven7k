import crypto from 'crypto';
import { config } from '../config';

export class SignatureVerification {
    static verifyLineSignature(body: string, signature: string): boolean {
        try {
            const channelSecret = config.line.channelSecret;
            const hmac = crypto.createHmac('SHA256', channelSecret);
            const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
            const digest = hmac.update(bodyStr).digest('base64');
            return digest === signature;
        } catch (error) {
            console.error('LINE signature verification error:', error);
            return false;
        }
    }

    static verifyViberSignature(body: string, signature: string): boolean {
        try {
            const authToken = config.viber.authToken;
            const hmac = crypto.createHmac('SHA256', authToken);
            const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
            const digest = hmac.update(bodyStr).digest('hex');
            return digest === signature;
        } catch (error) {
            console.error('Viber signature verification error:', error);
            return false;
        }
    }

    static verifyFacebookSignature(body: string, signature: string): boolean {
        try {
            const appSecret = config.facebook.appSecret;
            const hmac = crypto.createHmac('SHA1', appSecret);
            const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
            const expectedSignature = 'sha1=' + hmac.update(bodyStr).digest('hex');
            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );
        } catch (error) {
            console.error('Facebook signature verification error:', error);
            return false;
        }
    }
} 