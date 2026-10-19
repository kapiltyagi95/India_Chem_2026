// app/api/sendEmail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Agent } from 'undici';

export const POST = async (req: NextRequest) => {
    try {
        const emailPayload = await req.json();

        const emailApiUrl = 'https://bdcvtms.indianoil.in/MailApi/api/email';
        const emailApiKey = 'bdis@2025'; 

        // 1. Bypass SSL verification (matches Postman's behavior)
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const agent = new Agent({
            connect: {
                rejectUnauthorized: false, // Disables strict SSL certificate rejection
            },
        });

        const fetchOptions: any = {
            method: 'POST',
            headers: {
                'x-api-key': emailApiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
            dispatcher: agent, // Attach agent to fetch
        };

        console.log(`[sendEmail] Sending email to: ${emailApiUrl}`);

        const response = await fetch(emailApiUrl, fetchOptions);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`IOCL Email API Failed: Status ${response.status} - ${errorText}`);
            return NextResponse.json({ error: `IOCL API: ${errorText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Secure Email API error:', error);
        
        // Extract the exact underlying network cause (e.g., UNABLE_TO_VERIFY_LEAF_SIGNATURE, ETIMEDOUT, ENOTFOUND)
        const causeDetail = error.cause?.message || error.cause?.code || String(error.cause) || 'Unknown network error';
        
        return NextResponse.json({ 
            error: error.message,
            cause: causeDetail 
        }, { status: 500 });
    }
};