// app/api/send-tds-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/mssqlconnectdb'; // Assuming this correctly connects to your Supabase client

export const POST = async (req: NextRequest) => {
    try {
        const { gradeId, userEmail, userName } = await req.json();

        if (!gradeId || !userEmail) {
            return NextResponse.json({ error: 'Grade ID and user email are required' }, { status: 400 });
        }

        // 1. Fetch the grade details to get the tds_url
        const { data: gradeData, error: gradeError } = await supabase
            .from('ms_propel_grades')
            .select('tds_url, product_name, grade_id') // Select tds_url and any other relevant grade info
            .eq('grade_id', gradeId)
            .single();

        if (gradeError || !gradeData) {
            console.error('Error fetching grade TDS URL:', gradeError);
            return NextResponse.json({ error: 'Grade not found or TDS URL missing' }, { status: 404 });
        }

        const tdsUrl = gradeData.tds_url;
        const productName = gradeData.product_name;
        const fetchedGradeId = gradeData.grade_id; // Use fetched ID to be safe

        if (!tdsUrl) {
            return NextResponse.json({ error: 'TDS URL not available for this grade' }, { status: 404 });
        }

        // 2. Download the PDF from the tds_url
        const pdfResponse = await fetch(tdsUrl);
        if (!pdfResponse.ok) {
            throw new Error(`Failed to download PDF from ${tdsUrl}: ${pdfResponse.statusText}`);
        }
        const pdfBuffer = await pdfResponse.arrayBuffer();
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

        // Extract filename from URL (simple approach)
        const filenameMatch = tdsUrl.match(/\/([^\/?#]+)[\?#]?$/);
        const fileName = filenameMatch ? filenameMatch[1] : `${productName}_${fetchedGradeId}_TDS.pdf`;

        // 3. Prepare the email payload for your external API
        const mailSubject = `TDS for Polymer Grade: ${productName} - ${fetchedGradeId}`;
        const mailBody = `
            <h1>Hello ${userName || 'User'},</h1>
            <p>Thank you for your interest in our polymer grades. Please find the Technical Data Sheet (TDS) for <b>${productName} - ${fetchedGradeId}</b> attached.</p>
            <p>If you have any further questions, feel free to contact us.</p>
            <p>Regards,<br>Your Team</p>
        `;

        const emailPayload = {
            MailFrom: "pbdadmin@indianoil.in", // Your sender email
            MailTo: [userEmail],
            MailCCTo: ["yadavsp@indianoil.in"], // Optional: CC yourself
            MailBCCTo: ["yadavsp@indianoil.in"], // Optional: BCC yourself
            MailSubject: mailSubject,
            MailBody: mailBody,
            Attachments: [
                {
                    FileName: fileName,
                    ContentBase64: pdfBase64,
                },
            ],
        };

        // 4. Send the email using your external API
        const emailApiUrl = 'https://bdqacvtms.indianoil.in/api/email'; // Your external email API URL
        const emailApiKey = 'bdis@2025'; // Your external email API key

        const sendEmailResponse = await fetch(emailApiUrl, {
            method: 'POST',
            headers: {
                'x-api-key': emailApiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });

        if (!sendEmailResponse.ok) {
            const errorText = await sendEmailResponse.text();
            console.error('External email API error:', errorText);
            throw new Error(`Failed to send email: ${sendEmailResponse.status} - ${errorText}`);
        }

        const emailResult = await sendEmailResponse.json();
        console.log('Email sent successfully:', emailResult);

        return NextResponse.json({ message: 'Email sent successfully', emailResult });

    } catch (error: any) {
        console.error('Failed to send email with TDS attachment:', error);
        return NextResponse.json({ error: 'Failed to send email with TDS attachment', details: error.message }, { status: 500 });
    }
};