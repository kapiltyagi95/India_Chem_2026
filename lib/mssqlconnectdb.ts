// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { ProxyAgent } from 'undici';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize the options object
let supabaseOptions: any = {};

// if (isDevelopment) {
//     // 1. Disable SSL verification for corporate proxy environments in dev
//     process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//     // 2. Get proxy details
//     const pUser = process.env.PROXY_USER || "";
//     const pPass = process.env.PROXY_PASS || "";
//     const pHost = process.env.PROXY_HOST || "";
//     const pPort = process.env.PROXY_PORT || "";

//     // 3. Only create dispatcher if a proxy host is provided
//     if (pHost) {
//         const proxyUrl = `http://${encodeURIComponent(pUser)}:${encodeURIComponent(pPass)}@${pHost}:${pPort}`;
        
//         const dispatcher = new ProxyAgent({
//             uri: proxyUrl,
//         });

//         // 4. Add the dispatcher to the fetch options
//         supabaseOptions = {
//             global: {
//                 fetch: (url: string, options: any) => {
//                     return fetch(url, {
//                         ...options,
//                         dispatcher: dispatcher,
//                     });
//                 },
//             },
//         };
//         console.log("Supabase initialized with Development Proxy");
//     }
// }

// In production, supabaseOptions will be empty {}, and it will use standard fetch
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);