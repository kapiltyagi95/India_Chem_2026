// // app/api/send-tds-email/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/mssqlconnectdb'; // Assuming this correctly connects to your Supabase client

// export const POST = async (req: NextRequest) => {
//     try {
//         const { gradeId, userEmail, userName } = await req.json();

//         if (!gradeId || !userEmail) {
//             return NextResponse.json({ error: 'Grade ID and user email are required' }, { status: 400 });
//         }

//         // 1. Fetch the grade details to get the tds_url
//         const { data: gradeData, error: gradeError } = await supabase
//             .from('ms_propel_grades')
//             .select('tds_url, product_name, grade_id') // Select tds_url and any other relevant grade info
//             .eq('grade_id', gradeId)
//             .single();

//         if (gradeError || !gradeData) {
//             console.error('Error fetching grade TDS URL:', gradeError);
//             return NextResponse.json({ error: 'Grade not found or TDS URL missing' }, { status: 404 });
//         }

//         const tdsUrl = gradeData.tds_url;
//         const productName = gradeData.product_name;
//         const fetchedGradeId = gradeData.grade_id; // Use fetched ID to be safe

//         if (!tdsUrl) {
//             return NextResponse.json({ error: 'TDS URL not available for this grade' }, { status: 404 });
//         }

//         // 2. Download the PDF from the tds_url
//         const pdfResponse = await fetch(tdsUrl);
//         if (!pdfResponse.ok) {
//             throw new Error(`Failed to download PDF from ${tdsUrl}: ${pdfResponse.statusText}`);
//         }
//         const pdfBuffer = await pdfResponse.arrayBuffer();
//         const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

//         // Extract filename from URL (simple approach)
//         const filenameMatch = tdsUrl.match(/\/([^\/?#]+)[\?#]?$/);
//         const fileName = filenameMatch ? filenameMatch[1] : `${productName}_${fetchedGradeId}_TDS.pdf`;

//         // 3. Prepare the email payload for your external API
//         const mailSubject = `TDS for Polymer Grade: ${productName} - ${fetchedGradeId}`;
//         const mailBody = `
//             <h1>Hello ${userName || 'User'},</h1>
//             <p>Thank you for your interest in our polymer grades. Please find the Technical Data Sheet (TDS) for <b>${productName} - ${fetchedGradeId}</b> attached.</p>
//             <p>If you have any further questions, feel free to contact us.</p>
//             <p>Regards,<br>Your Team</p>
//         `;

//         const emailPayload = {
//             MailFrom: "iocladmin@indianoil.in", // Your sender email
//             MailTo: [userEmail],
//             MailCCTo: ["yadavsp@indianoil.in"], // Optional: CC yourself
//             MailBCCTo: ["yadavsp@indianoil.in"], // Optional: BCC yourself
//             MailSubject: mailSubject,
//             MailBody: mailBody,
//             Attachments: [
//                 {
//                     FileName: fileName,
//                     ContentBase64: pdfBase64,
//                 },
//             ],
//         };

//         // 4. Send the email using your external API
//         const emailApiUrl = 'https://bdcvtms.indianoil.in/MailApi/api/email'; // Your external email API URL
//         const emailApiKey = 'bdis@2025'; // Your external email API key

//         const sendEmailResponse = await fetch(emailApiUrl, {
//             method: 'POST',
//             headers: {
//                 'x-api-key': emailApiKey,
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(emailPayload),
//         });

//         if (!sendEmailResponse.ok) {
//             const errorText = await sendEmailResponse.text();
//             console.error('External email API error:', errorText);
//             throw new Error(`Failed to send email: ${sendEmailResponse.status} - ${errorText}`);
//         }

//         const emailResult = await sendEmailResponse.json();
//         console.log('Email sent successfully:', emailResult);

//         return NextResponse.json({ message: 'Email sent successfully', emailResult });

//     } catch (error: any) {
//         console.error('Failed to send email with TDS attachment:', error);
//         return NextResponse.json({ error: 'Failed to send email with TDS attachment', details: error.message }, { status: 500 });
//     }
// };


// app/api/send-tds-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/mssqlconnectdb';
import { Agent } from 'undici';

export const POST = async (req: NextRequest) => {
    try {
        const { gradeId, userEmail, userName } = await req.json();

        if (!gradeId || !userEmail) {
            return NextResponse.json({ error: 'Grade ID and user email are required' }, { status: 400 });
        }

        // 1. Fetch the grade details to get the tds_url
        const { data: gradeData, error: gradeError } = await supabase
            .from('ms_propel_grades')
            .select('tds_url, product_name, grade_id')
            .eq('grade_id', gradeId)
            .single();

        if (gradeError || !gradeData) {
            console.error('Error fetching grade TDS URL:', gradeError);
            return NextResponse.json({ error: 'Grade not found or TDS URL missing' }, { status: 404 });
        }

        const tdsUrl = gradeData.tds_url;
        const productName = gradeData.product_name;
        const fetchedGradeId = gradeData.grade_id;

        if (!tdsUrl) {
            return NextResponse.json({ error: 'TDS URL not available for this grade' }, { status: 404 });
        }

        // 2. Download the PDF directly on the Vercel server (No corporate proxy needed on Vercel)
        console.log(`[send-tds-email] Downloading PDF from: ${tdsUrl}`);
        const pdfResponse = await fetch(tdsUrl);
        if (!pdfResponse.ok) {
            throw new Error(`Failed to download PDF from storage: ${pdfResponse.statusText}`);
        }
        const pdfBuffer = await pdfResponse.arrayBuffer();
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

        // Extract filename
        const filenameMatch = tdsUrl.match(/\/([^\/?#]+)[\?#]?$/);
        const fileName = filenameMatch ? filenameMatch[1] : `${productName}_${fetchedGradeId}_TDS.pdf`;

        // 3. Prepare email payload
        const mailSubject = `IOCL TDS for Polymer Grade: ${productName} - ${fetchedGradeId}`;
        const mailBody = `
            <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #002480; margin: 0; padding-bottom: 10px; border-bottom: 1px solid #eee;">Technical Data Sheet</h2>
                </div>
                <p>Dear ${userName || 'Valued Customer'},</p>
                <p>Thank you for reaching out to us. We appreciate your interest in our polymer grades.</p>
                <p>Please find the Technical Data Sheet (TDS) for <b>${productName} - ${fetchedGradeId}</b> attached to this email.</p>
                <p>Should you require any further information, please do not hesitate to contact our team.</p>
                <p style="margin-top: 30px;">Best regards,</p>
                <p style="margin: 0; font-weight: bold; color: #002480;">The IndianOil Team</p>
            </div>
        `;

        const emailPayload = {
            MailFrom: "iocladmin@indianoil.in", // Use the sender email authorized by your API
            MailTo: [userEmail],
            MailCCTo: "",
            MailBCCTo: ["yadavsp@indianoil.in"],
            MailSubject: mailSubject,
            MailBody: mailBody,
            Attachments: [
                {
                    FileName: fileName,
                    ContentBase64: pdfBase64,
                },
            ],
        };

        // 4. Configure fetch with SSL bypass for IOCL API
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const agent = new Agent({
            connect: {
                rejectUnauthorized: false, // Prevents "fetch failed" SSL crash on Vercel
            },
        });

        // Use the exact URL that worked in Postman
        const emailApiUrl = 'https://bdcvtms.indianoil.in/MailApi/api/email'; 
        const emailApiKey = 'bdis@2025';

        const sendEmailResponse = await fetch(emailApiUrl, {
            method: 'POST',
            headers: {
                'x-api-key': emailApiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
            dispatcher: agent,
        } as any);

        if (!sendEmailResponse.ok) {
            const errorText = await sendEmailResponse.text();
            console.error(`IOCL Email API Error: ${sendEmailResponse.status} - ${errorText}`);
            return NextResponse.json({ error: errorText }, { status: sendEmailResponse.status });
        }

        const emailResult = await sendEmailResponse.json();
        return NextResponse.json({ message: 'Email sent successfully', emailResult });

    } catch (error: any) {
        console.error('Failed to send email with TDS attachment:', error);
        const causeDetail = error.cause?.message || error.cause?.code || String(error.cause) || 'Unknown network error';
        return NextResponse.json({ 
            error: error.message || 'Failed to send email with TDS attachment', 
            cause: causeDetail 
        }, { status: 500 });
    }
};