// // import { NextRequest, NextResponse } from 'next/server';

// // export const GET = async (req: NextRequest) => {
// //     const { searchParams } = new URL(req.url);
// //     const externalUrl = searchParams.get('url');

// //     if (!externalUrl) {
// //         return NextResponse.json({ error: 'URL parameter is missing' }, { status: 400 });
// //     }

// //     try {
// //         const response = await fetch(externalUrl);

// //         if (!response.ok) {
// //             return NextResponse.json(
// //                 { error: `Failed to fetch external resource: ${response.statusText}` },
// //                 { status: response.status }
// //             );
// //         }

// //         // Get content type from the original response
// //         const contentType = response.headers.get('content-type') || 'application/octet-stream';

// //         // Return the blob directly
// //         return new NextResponse(response.body, {
// //             headers: {
// //                 'Content-Type': contentType,
// //                 'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
// //             },
// //         });

// //     } catch (error: any) {
// //         console.error('Proxy PDF error:', error);
// //         return NextResponse.json({ error: 'Internal server error while proxying PDF', details: error.message }, { status: 500 });
// //     }
// // };

// // app/api/proxy-pdf/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { ProxyAgent } from 'undici'; // IMPORT THIS for proxy routing

// export const GET = async (req: NextRequest) => {
//     const { searchParams } = new URL(req.url);
//     const externalUrl = searchParams.get('url');

//     if (!externalUrl) {
//         return NextResponse.json({ error: 'URL parameter is missing' }, { status: 400 });
//     }

//     try {
//         let fetchOptions: any = {};

//         // --- NEW PROXY LOGIC ---
//         // Reads proxy settings from your .env.local file
//         const pHost = process.env.PROXY_HOST || "";
//         const pPort = process.env.PROXY_PORT || "";
//         const pUser = process.env.PROXY_USER || "";
//         const pPass = process.env.PROXY_PASS || "";

//         if (pHost && process.env.NODE_ENV === 'development') {
//             process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass corporate SSL issues

//             const proxyUrl = pUser && pPass 
//                 ? `http://${encodeURIComponent(pUser)}:${encodeURIComponent(pPass)}@${pHost}:${pPort}`
//                 : `http://${pHost}:${pPort}`;
            
//             fetchOptions = {
//                 dispatcher: new ProxyAgent({ uri: proxyUrl })
//             };
//             console.log(`[Proxy] Downloading PDF via Corporate Proxy...`);
//         } else {
//             console.log(`[Direct] Downloading PDF without Proxy...`);
//         }
//         // ------------------------

//         // Pass the fetchOptions (which contains the proxy dispatcher) into the fetch request
//         const response = await fetch(externalUrl, fetchOptions);

//         if (!response.ok) {
//             console.error(`PDF Download Error: ${response.status} ${response.statusText}`);
//             return NextResponse.json(
//                 { error: `Failed to fetch external resource: ${response.statusText}` },
//                 { status: response.status }
//             );
//         }

//         // Get content type from the original response
//         const contentType = response.headers.get('content-type') || 'application/octet-stream';

//         // Return the blob directly
//         return new NextResponse(response.body, {
//             headers: {
//                 'Content-Type': contentType,
//                 'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
//             },
//         });

//     } catch (error: any) {
//         console.error('Proxy PDF error:', error);
//         return NextResponse.json({ error: 'Internal server error while proxying PDF', details: error.message }, { status: 500 });
//     }
// };


// app/api/proxy-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const externalUrl = searchParams.get('url');

    if (!externalUrl) {
        return NextResponse.json({ error: 'URL parameter is missing' }, { status: 400 });
    }

    try {
        // Direct fetch from Supabase on Vercel
        const response = await fetch(externalUrl);

        if (!response.ok) {
            console.error(`[proxy-pdf] Failed to fetch: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { error: `Failed to fetch external resource: ${response.statusText}` },
                { status: response.status }
            );
        }

        const contentType = response.headers.get('content-type') || 'application/pdf';

        return new NextResponse(response.body, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });

    } catch (error: any) {
        console.error('Proxy PDF error:', error);
        return NextResponse.json(
            { error: 'Internal server error while proxying PDF', details: error.message },
            { status: 500 }
        );
    }
};