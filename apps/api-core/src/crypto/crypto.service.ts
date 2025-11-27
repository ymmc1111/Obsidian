import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
    // In a real FIPS scenario, we would ensure the underlying Node.js is built with FIPS support
    // and potentially use a specific FIPS-compliant module or HSM interface.

    // For now, we use standard Node.js crypto for SHA-256 and Ed25519.

    /**
     * Generates a SHA-256 hash of the input data.
     */
    hash(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Generates a key pair for Ed25519 signing.
     * In production, keys would be managed by an HSM or KMS.
     */
    generateKeyPair() {
        return crypto.generateKeyPairSync('ed25519', {
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
    }

    /**
   * Signs data using a private key.
   */
    sign(data: string, privateKey: string): string {
        // For Ed25519, we use the top-level sign function. 
        // The first argument 'algorithm' is null because Ed25519 doesn't use a separate digest.
        return crypto.sign(null, Buffer.from(data), privateKey).toString('hex');
    }

    /**
     * Verifies a signature using a public key.
     */
    verify(data: string, signature: string, publicKey: string): boolean {
        return crypto.verify(null, Buffer.from(data), publicKey, Buffer.from(signature, 'hex'));
    }
}
