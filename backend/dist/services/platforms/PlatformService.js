"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformService = void 0;
class PlatformService {
    constructor() {
        this.initialized = false;
    }
    isInitialized() {
        return this.initialized;
    }
    validateConfig(config, requiredFields) {
        const missingFields = requiredFields.filter(field => !config[field]);
        if (missingFields.length > 0) {
            throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
        }
    }
}
exports.PlatformService = PlatformService;
