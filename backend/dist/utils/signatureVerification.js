"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureVerification = void 0;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
class SignatureVerification {
    static verifyLineSignature(body, signature) {
        try {
            const channelSecret = config_1.config.line.channelSecret;
            const hmac = crypto_1.default.createHmac('SHA256', channelSecret);
            const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
            const digest = hmac.update(bodyStr).digest('base64');
            return digest === signature;
        }
        catch (error) {
            console.error('LINE signature verification error:', error);
            return false;
        }
    }
    static verifyViberSignature(body, signature) {
        try {
            const authToken = config_1.config.viber.authToken;
            const hmac = crypto_1.default.createHmac('SHA256', authToken);
            const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
            const digest = hmac.update(bodyStr).digest('hex');
            return digest === signature;
        }
        catch (error) {
            console.error('Viber signature verification error:', error);
            return false;
        }
    }
    static verifyFacebookSignature(body, signature) {
        try {
            const appSecret = config_1.config.facebook.appSecret;
            const hmac = crypto_1.default.createHmac('SHA1', appSecret);
            const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
            const expectedSignature = 'sha1=' + hmac.update(bodyStr).digest('hex');
            return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        }
        catch (error) {
            console.error('Facebook signature verification error:', error);
            return false;
        }
    }
}
exports.SignatureVerification = SignatureVerification;
