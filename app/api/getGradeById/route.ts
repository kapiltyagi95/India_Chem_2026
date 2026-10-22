import { supabase } from '@/lib/mssqlconnectdb'; // Assuming you have this configured
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const gradeId = searchParams.get('gradeId');

    if (!gradeId) {
      return NextResponse.json({ error: 'Grade ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
  .from('ms_propel_grades')
  .select(`
    GRADE_ID:grade_id, 
    PRODUCT_NAME:product_name, 
    SECTOR_NAME:sector_name, 
    SUB_SECTOR:sub_sector,
    MFI:mfi, 
    DENSITY:density, 
    SPECIAL_CHARACTERISTICS:special_characteristics, 
    GRADE_APPLICATION:grade_application,
    TECHNOLOGY:technology,
    TECHNICAL_SPECIFICATION:technical_specification,
    tds_url 
  `)
  .eq('grade_id', gradeId)
  .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({ message: 'Grade not found' }, { status: 404 });
      }
      throw error;
    }

    if (!data) {
        return NextResponse.json({ message: 'Grade not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Supabase query failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};