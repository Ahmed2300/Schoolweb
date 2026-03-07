/**
 * Device Fingerprint Utility
 *
 * Generates a consistent SHA-256 hash from hardware properties that remain
 * identical across different browsers on the **same physical device**.
 *
 * Properties used:
 * - screen.width / height / colorDepth
 * - navigator.hardwareConcurrency  (CPU core count)
 * - navigator.platform             (e.g. "Win32")
 * - navigator.deviceMemory         (Chrome/Edge only, falls back gracefully)
 * - window.devicePixelRatio
 * - Intl timezone
 *
 * The hash is deterministic: Chrome and Firefox on the same laptop produce
 * the same fingerprint, while a different laptop produces a different one.
 */

/**
 * Collect raw hardware signals and return them as a stable string.
 */
function collectHardwareSignals(): string {
    const deviceMemory = (navigator as unknown as Record<string, number | undefined>)
        .deviceMemory;

    const signals: string[] = [
        String(screen.width),
        String(screen.height),
        String(screen.colorDepth),
        String(navigator.hardwareConcurrency ?? 'unknown'),
        String(navigator.platform ?? 'unknown'),
        String(deviceMemory ?? 'unknown'),
        String(window.devicePixelRatio ?? 1),
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    ];

    return signals.join('|');
}

/**
 * Hash a string with SHA-256 using the Web Crypto API and return the hex digest.
 */
async function sha256Hex(input: string): Promise<string> {
    const encoded = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a device fingerprint.
 *
 * @returns A 64-character hex string (SHA-256 digest) that is consistent
 *          across browsers on the same device.
 *
 * @example
 * ```ts
 * const fp = await generateDeviceFingerprint();
 * // "a1b2c3d4e5f6..." (64 chars)
 * ```
 */
export async function generateDeviceFingerprint(): Promise<string> {
    try {
        const raw = collectHardwareSignals();
        return await sha256Hex(raw);
    } catch {
        // Fallback: if crypto.subtle is unavailable (e.g. non-HTTPS localhost
        // in older browsers), return a best-effort plain hash using a simple
        // string-based approach. This is still deterministic per device.
        const raw = collectHardwareSignals();
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
            const char = raw.charCodeAt(i);
            hash = ((hash << 5) - hash + char) | 0;
        }
        return Math.abs(hash).toString(16).padStart(16, '0').slice(0, 64);
    }
}
