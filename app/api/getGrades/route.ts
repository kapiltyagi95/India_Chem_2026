// app/api/getGrades/route.ts
import { supabase } from '@/lib/mssqlconnectdb';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    const { interestArea, characteristics, product, subCategory, sector, subSector } = await req.json();

    let query = supabase
      .from('ms_propel_grades') 
      .select(`
        GRADE_ID:grade_id, 
        PRODUCT_NAME:product_name, 
        SECTOR_NAME:sector_name, 
        MFI:mfi, 
        DENSITY:density, 
        SPECIAL_CHARACTERISTICS:special_characteristics, 
        GRADE_APPLICATION:grade_application
      `);

    // 1. STRICT DROPDOWN MATCHING
    if (product && product.trim() !== '') query = query.eq('product_name', product.trim());
    if (subCategory && subCategory.trim() !== '') query = query.eq('sub_category', subCategory.trim());
    if (sector && sector.trim() !== '') query = query.eq('sector_name', sector.trim());
    if (subSector && subSector.trim() !== '') query = query.eq('sub_sector', subSector.trim());

    // 2. TEXT SEARCH
    const hasInterest = interestArea && interestArea.trim() !== '';
    const hasChars = characteristics && characteristics.trim() !== '';

    if (hasInterest && hasChars) {
        // FIX: Remove accidental quotes and wrap the whole search term in double-quotes.
        // This protects against commas (,) breaking the Supabase .or() parser!
        const safeInterest = interestArea.replace(/"/g, ''); 
        const safeChars = characteristics.replace(/"/g, '');
        
        query = query.or(`grade_application.ilike."%${safeInterest}%",special_characteristics.ilike."%${safeChars}%"`);
    } else if (hasInterest) {
        query = query.ilike('grade_application', `%${interestArea}%`);
    } else if (hasChars) {
        query = query.ilike('special_characteristics', `%${characteristics}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Supabase Query Error:", error);
        throw error;
    }
    
    return NextResponse.json(data || []);
    
  } catch (error: any) {
    console.error('Supabase getGrades failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};