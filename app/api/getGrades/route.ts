// app/api/getGrades/route.ts
import { supabase } from '@/lib/mssqlconnectdb';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    const { interestArea, characteristics, product, subCategory, sector, subSector } = await req.json();

    console.log('--- GET GRADES API TRIGGERED ---');
    console.log('Filters received:', { interestArea, characteristics, product, subCategory, sector, subSector });

    let query = supabase
      .from('ms_propel_grades') 
      .select(`
        id,
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
      `);

    // 1. OPTIONAL DROPDOWNS (Only applied if selected by user)
    if (product && product.trim() !== '') {
        query = query.eq('product_name', product.trim());
    }
    if (subCategory && subCategory.trim() !== '') {
        query = query.eq('sub_category', subCategory.trim());
    }
    if (sector && sector.trim() !== '') {
        query = query.eq('sector_name', sector.trim());
    }
    if (subSector && subSector.trim() !== '') {
        query = query.eq('sub_sector', subSector.trim());
    }

    // 2. DIRECT SEARCH (Smart multi-column search across Polymers & Aromatics)
    const term = interestArea ? interestArea.replace(/"/g, '').trim() : '';
    const chars = characteristics ? characteristics.replace(/"/g, '').trim() : '';

    if (term && chars) {
        // If both application term and characteristic are present
        query = query.or(
          `grade_application.ilike."%${term}%",product_name.ilike."%${term}%",grade_id.ilike."%${term}%",special_characteristics.ilike."%${chars}%",technical_specification.ilike."%${chars}%"`
        );
    } else if (term) {
        // DIRECT SEARCH: Searches Grade Application, Product Name, and Grade ID
        query = query.or(
          `grade_application.ilike."%${term}%",product_name.ilike."%${term}%",grade_id.ilike."%${term}%"`
        );
    } else if (chars) {
        // Characteristic or Technical Spec search
        query = query.or(
          `special_characteristics.ilike."%${chars}%",technical_specification.ilike."%${chars}%"`
        );
    }

    // 3. EXECUTE QUERY
    const { data, error } = await query;

    if (error) {
        console.error("Supabase Query Error:", error);
        throw error;
    }
    
    console.log(`Matching grades found: ${data?.length || 0}`);
    return NextResponse.json(data || []);
    
  } catch (error: any) {
    console.error('Supabase getGrades failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};