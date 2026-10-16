// app/api/getSuggestions/route.ts
import { supabase } from '@/lib/mssqlconnectdb';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const queryTerm = searchParams.get('query') || '';
    
    const product = searchParams.get('product') || '';
    const subCategory = searchParams.get('subCategory') || '';
    const sector = searchParams.get('sector') || '';
    const subSector = searchParams.get('subSector') || '';

    if (queryTerm.length < 3) return NextResponse.json([]);

    let query = supabase
      .from('ms_propel_grades')
      // WE ADDED special_characteristics to the select statement here!
      .select('product_name, grade_id, grade_application, special_characteristics');

    if (product) query = query.eq('product_name', product);
    if (subCategory) query = query.eq('sub_category', subCategory);
    if (sector) query = query.eq('sector_name', sector);
    if (subSector) query = query.eq('sub_sector', subSector);

    query = query.or(`grade_application.ilike.%${queryTerm}%,product_name.ilike.%${queryTerm}%,grade_id.ilike.%${queryTerm}%`)
                 .limit(10); 

    const { data, error } = await query;

    if (error) throw error;

    // NOW WE RETURN AN OBJECT { label: "...", characteristics: "..." }
    const suggestions = data.map((item: any) => {
      const parts = [];
      if (item.product_name) parts.push(item.product_name);
      if (item.grade_id) parts.push(item.grade_id);
      if (item.grade_application) parts.push(item.grade_application);
      
      return {
          label: parts.join(' - '),
          characteristics: item.special_characteristics || ''
      };
    }).filter((item) => item.label); 

    // Remove duplicates based on the label string
    const uniqueSuggestions = Array.from(new Map(suggestions.map(item => [item.label, item])).values());

    return NextResponse.json(uniqueSuggestions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};