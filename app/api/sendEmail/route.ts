// app/api/sendEmail/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
    try {
        const emailPayload = await req.json();

        // 1. Your REAL IOCL Email credentials (Hidden securely on the server!)
        const emailApiUrl = 'https://bdintranet.indianoil.in/mail_api/api/email';
        const emailApiKey = 'bdis@2025'; 

        const fetchOptions = {
            method: 'POST',
            headers: {
                'x-api-key': emailApiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        };

        console.log(`[Direct] Sending Email via IOCL API...`);

        // 2. Send the request directly to IOCL Email API
        const response = await fetch(emailApiUrl, fetchOptions);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`IOCL Email API Failed: Status ${response.status} - ${errorText}`);
            return NextResponse.json({ error: `IOCL API Failed: ${errorText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Secure Email API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};