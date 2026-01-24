import express from 'express';
import cors from 'cors';
import { IncomingHttpHeaders } from 'http';

const app = express();
const PORT = 3001;

app.use(cors());

// Middleware to parse raw body to support any content type forwarding
app.use(express.raw({ type: '*/*', limit: '50mb' }));

app.all('/proxy', async (req, res) => {
    const targetUrl = req.headers['x-target-url'] as string;

    if (!targetUrl) {
        console.error('Missing x-target-url header');
        res.status(400).send('Missing x-target-url header');
        return;
    }

    console.log(`[Proxy] Forwarding ${req.method} request to: ${targetUrl}`);

    try {
        // Filter out host and connection headers to avoid conflicts
        const headers: Record<string, string> = {};
        Object.entries(req.headers).forEach(([key, value]) => {
            if (['host', 'connection', 'content-length', 'x-target-url'].includes(key.toLowerCase())) return;
            if (typeof value === 'string') headers[key] = value;
            else if (Array.isArray(value)) headers[key] = value.join(', ');
        });

        const options: RequestInit = {
            method: req.method,
            headers: headers,
        };

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            // Forward the raw buffer body
            options.body = req.body;
        }

        const response = await fetch(targetUrl, options);

        // Copy response headers
        // Copy response headers
        response.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            // Avoid CORS issues and encoding mismatches
            if (lowerKey.startsWith('access-control-')) return;
            if (lowerKey === 'content-encoding') return; // Node fetch decompresses automatically
            if (lowerKey === 'content-length') return; // Length changes after decompression

            res.setHeader(key, value);
        });

        res.status(response.status);

        // Pipe response body
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));

        console.log(`[Proxy] Success: ${response.status} from ${targetUrl}`);

    } catch (error: any) {
        console.error('[Proxy] Error:', error.message);
        // Return the error details to the frontend
        res.status(502).json({
            error: 'Proxy Error',
            details: error.message,
            target: targetUrl
        });
    }
});

export function startServer() {
    return new Promise<void>((resolve, reject) => {
        const server = app.listen(PORT, '127.0.0.1', () => {
            console.log(`Internal Proxy Server running on port ${PORT}`);
            resolve();
        });
        server.on('error', reject);
    });
}
