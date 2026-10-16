// // app/api/getFilterOptions/route.ts
// import { supabase } from '@/lib/mssqlconnectdb';
// import { NextResponse } from 'next/server';

// export const GET = async () => {
//   try {
//     const { data, error } = await supabase
//       .from('ms_propel_grades')
//       .select('product_name, sub_category, sector_name, sub_sector');

//     // 1. Log any Supabase errors directly to your VS Code terminal
//     if (error) {
//         console.error("Supabase Fetch Error:", error);
//         throw error;
//     }

//     // 2. Log the raw data to see if it's actually finding the rows
//     console.log("Raw Data from Supabase:", data?.length, "rows found");

//     const uniqueProducts = Array.from(new Set((data || []).map(item => item.product_name).filter(Boolean)));
//     const uniqueSubCategories = Array.from(new Set((data || []).map(item => item.sub_category).filter(Boolean)));
//     const uniqueSectors = Array.from(new Set((data || []).map(item => item.sector_name).filter(Boolean)));
//     const uniqueSubSectors = Array.from(new Set((data || []).map(item => item.sub_sector).filter(Boolean)));

//     return NextResponse.json({
//       products: uniqueProducts.sort(),
//       subCategories: uniqueSubCategories.sort(),
//       sectors: uniqueSectors.sort(),
//       subSectors: uniqueSubSectors.sort()
//     });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// };


// app/api/getFilterOptions/route.ts
import { supabase } from '@/lib/mssqlconnectdb';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    // Fetch all combinations
    const { data, error } = await supabase
      .from('ms_propel_grades')
      .select('product_name, sub_category, sector_name, sub_sector');

    if (error) {
        console.error("Supabase Fetch Error:", error);
        throw error;
    }

    console.log("Raw Data from Supabase:", data?.length, "rows found");

    // INSTEAD of splitting them into 4 unique arrays, 
    // we return the RAW rows. The frontend will use this to build the cascading logic!
    return NextResponse.json(data || []);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};