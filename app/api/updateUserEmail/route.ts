// app/api/updateUserEmail/route.ts
import { supabase } from '@/lib/mssqlconnectdb';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
    try {
        const { id, name, email } = await req.json();

        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        if (id) {
            // 1. UPDATE EXACTLY ONE ROW USING THE PRIMARY KEY ID
            const { data, error: updateError } = await supabase
                .from('user_interests')
                .update({ email: email })
                .eq('id', id)
                .select(); 

            if (updateError) throw updateError;
            
            return NextResponse.json({ message: 'Email updated successfully', data });
        } else {
            // Fallback: If they skipped the form entirely and have no ID in session
            const { error: insertError } = await supabase
                .from('user_interests')
                .insert([{ name: name || 'Kiosk Direct User', mobile_no: 'N/A', email: email }]);

            if (insertError) throw insertError;

            return NextResponse.json({ message: 'Email saved successfully' });
        }

    } catch (error: any) {
        console.error('Supabase Email Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};