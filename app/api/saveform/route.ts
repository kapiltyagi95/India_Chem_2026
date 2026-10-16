// app/api/saveform/route.ts
import { supabase } from '@/lib/mssqlconnectdb';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { name, mobileNumber, interest_Area, Characterestics } = body;

        const { data, error } = await supabase
            .from('user_interests')
            .insert([
                { 
                    name: name, 
                    mobile_no: mobileNumber, 
                    // email: '',               
                    interest_area: interest_Area, 
                    characteristics: Characterestics
                }
            ])
            .select('id') // <-- THIS GRABS THE NEW ROW ID
            .single();

        if (error) throw error;

        // RETURN THE ID TO THE FRONTEND!
        return NextResponse.json({ message: 'Data saved successfully', id: data.id });
    } catch (error: any) {
        console.error('Supabase insert error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}