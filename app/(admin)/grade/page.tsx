'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Beaker, Atom, Microscope, TestTube, Pipette, Flame, Ruler, FlaskConical, Lightbulb, Package, X, Factory, Box, Tags } from "lucide-react";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Grade {
    PRODUCT_NAME: string;
    SECTOR_NAME: string;
    GRADE_ID: string;
    MFI: string;
    DENSITY: string;
    SPECIAL_CHARACTERISTICS: string;
    GRADE_APPLICATION: string;
}

// Added the new dropdown filters to the state interface
interface SearchFilters {
    interestArea: string[];
    characteristics: string[];
    product: string;
    subCategory: string;
    sector: string;
    subSector: string;
}

const productIcons: { [key: string]: React.ElementType } = {
    "LLDPE": Atom,
    "PP": Beaker,
    "HDPE": FlaskConical,
};

const GradesPage = () => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Updated state to include the new dropdown filters
    const [filters, setFilters] = useState<SearchFilters>({
        interestArea: [],
        characteristics: [],
        product: '',
        subCategory: '',
        sector: '',
        subSector: ''
    });

    const [isInitialLoad, setIsInitialLoad] = useState(true); 
    const isMounted = useRef(false); 

    const router = useRouter();

    // Effect to initialize filters from URL on initial load
    useEffect(() => {
        isMounted.current = true; 
        const { search } = window.location;
        const queryParams = new URLSearchParams(search);
        
        const area = queryParams.get('interest_Area') || '';
        const chars = queryParams.get('Characterestics') || '';
        const prod = queryParams.get('product') || '';
        const subCat = queryParams.get('subCategory') || '';
        const sec = queryParams.get('sector') || '';
        const subSec = queryParams.get('subSector') || '';

        setFilters({
            interestArea: area ? [area] : [],
            characteristics: chars ? [chars] : [],
            product: prod,
            subCategory: subCat,
            sector: sec,
            subSector: subSec
        });
        
        setIsInitialLoad(false); 
        
        return () => { isMounted.current = false; };
    }, []); 

    // Memoize the fetch function to include all filters
    const fetchGrades = useCallback(async (currentFilters: SearchFilters) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/getGrades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interestArea: currentFilters.interestArea.join(','),
                    characteristics: currentFilters.characteristics.join(','),
                    product: currentFilters.product,
                    subCategory: currentFilters.subCategory,
                    sector: currentFilters.sector,
                    subSector: currentFilters.subSector
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const result: Grade[] = await response.json();
            
            if (isMounted.current) { 
                setGrades(result);
            }
        } catch (err) {
            if (isMounted.current) setError("Error fetching grades");
            console.error(err);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, []);

    // Effect to call API whenever ANY filter changes
    useEffect(() => {
        if (isInitialLoad) return;
        
        const newSearchParams = new URLSearchParams();
        if (filters.interestArea.length > 0) newSearchParams.set('interest_Area', filters.interestArea.join(','));
        if (filters.characteristics.length > 0) newSearchParams.set('Characterestics', filters.characteristics.join(','));
        if (filters.product) newSearchParams.set('product', filters.product);
        if (filters.subCategory) newSearchParams.set('subCategory', filters.subCategory);
        if (filters.sector) newSearchParams.set('sector', filters.sector);
        if (filters.subSector) newSearchParams.set('subSector', filters.subSector);
        
        router.replace(`?${newSearchParams.toString()}`); 

        fetchGrades(filters);

    }, [filters, fetchGrades, router, isInitialLoad]);

    // Handle removing BOTH array filters (interest area) and string filters (dropdowns)
    const removeFilter = (type: keyof SearchFilters, value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            if (type === 'interestArea' || type === 'characteristics') {
                newFilters[type] = (newFilters[type] as string[]).filter(item => item !== value);
            } else {
                newFilters[type] = ''; // Clear the dropdown filter
            }
            return newFilters;
        });
    };

    if (loading && isInitialLoad) return <div className="text-center py-20 text-xl font-semibold text-white">Loading Polymer Grades...</div>;
    if (loading && !isInitialLoad) return <div className="text-center py-20 text-xl font-semibold text-white">Updating Polymer Grades...</div>;
    if (error) return <div className="text-center py-20 text-red-600 font-bold">Error: {error}</div>;

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-2 text-white flex flex-col h-screen">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-center tracking-tight text-transparent bg-clip-text text-white">
                Matching Polymer Grades
            </h1>
            <p className="text-center text-gray-400 text-lg mb-2">
                {grades.length > 0 ? `Showing ${grades.length} grades` : 'No grades found'}
            </p>

            {/* Filter Pills - Now supports ALL filters */}
            <div className="flex justify-center flex-wrap gap-3 mb-8 z-10 relative">
                {filters.product && (
                    <span className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium shadow-md cursor-pointer transition-colors"
                          onClick={() => removeFilter('product', filters.product)}>
                        Product: {filters.product} <X className="ml-2 h-4 w-4" />
                    </span>
                )}
                {filters.subCategory && (
                    <span className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium shadow-md cursor-pointer transition-colors"
                          onClick={() => removeFilter('subCategory', filters.subCategory)}>
                        Sub-Cat: {filters.subCategory} <X className="ml-2 h-4 w-4" />
                    </span>
                )}
                {filters.sector && (
                    <span className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium shadow-md cursor-pointer transition-colors"
                          onClick={() => removeFilter('sector', filters.sector)}>
                        Sector: {filters.sector} <X className="ml-2 h-4 w-4" />
                    </span>
                )}
                {filters.subSector && (
                    <span className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium shadow-md cursor-pointer transition-colors"
                          onClick={() => removeFilter('subSector', filters.subSector)}>
                        Sub-Sec: {filters.subSector} <X className="ml-2 h-4 w-4" />
                    </span>
                )}
                {filters.interestArea.map(filter => (
                    <span key={filter} className="flex items-center bg-white/90 text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-md cursor-pointer transition-colors"
                          onClick={() => removeFilter('interestArea', filter)}>
                        {filter} <X className="ml-2 h-4 w-4 text-gray-700" />
                    </span>
                ))}
                {filters.characteristics.map(filter => (
                    <span key={filter} className="flex items-center bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md cursor-pointer"
                          onClick={() => removeFilter('characteristics', filter)}>
                        {filter} <X className="ml-2 h-4 w-4 text-gray-300" />
                    </span>
                ))}
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {grades.length > 0 ? (
                        grades.map((grade, index) => {
                            const ProductIcon = productIcons[grade.PRODUCT_NAME] || Package;

                            return (
                                <Card key={grade.GRADE_ID} className="overflow-hidden shadow-md bg-white">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Badge className='bg-gradient-to-b from-[#E3CBBE] to-[#FFFFFF] border border-3 border-[#000000] text-white shadow-lg p-1 px-2'>
                                                <ProductIcon className="h-6 w-6 text-black mr-2" />
                                                <span className="text-sm font-normal text-gray-900">
                                                    {grade.PRODUCT_NAME}
                                                </span>
                                            </Badge>
                                            <Badge className='bg-gradient-to-b from-[#E3CBBE] to-[#FFFFFF] border-1 border-[#000000] text-white shadow-lg'>
                                                <span className="text-sm font-normal text-gray-900">
                                                    Grade ID –
                                                    <Badge className='bg-white border-1 border-[#000000] text-black shadow-lg m-1'>
                                                        <span className="text-sm font-normal text-gray-900">
                                                            {grade.GRADE_ID}
                                                        </span>
                                                    </Badge>
                                                </span>
                                            </Badge>
                                        </div>
                                        <Button onClick={() => router.push(`/grade/${grade.GRADE_ID}`)}
                                            className="bg-gradient-to-b from-[#f36f21] to-[#ffd6be] text-[#00164E] font-bold hover:opacity-90 rounded-full"
                                        >
                                            View Details
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className='bg-gradient-to-b from-[#C5D5FF] to-[#EBF1FF] border-1 border-[#000000] text-white shadow-lg'>
                                                <span className="text-sm font-normal text-gray-900">
                                                    Sector –
                                                    <Badge className='bg-white border-1 border-[#000000] text-black shadow-lg m-1'>
                                                        <span className="text-sm font-normal text-gray-900">
                                                            {grade.SECTOR_NAME}
                                                        </span>
                                                    </Badge>
                                                </span>
                                            </Badge>
                                            <Badge variant="secondary" className='bg-gradient-to-b from-[#C5D5FF] to-[#EBF1FF] border-1 border-[#000000] text-white shadow-lg'>
                                                <Ruler className="mr-1 h-4 w-4 text-pink-400" />
                                                <span className="text-sm font-normal text-gray-900">MFI –</span>
                                                <Badge className='bg-white border-1 border-[#000000] text-black shadow-lg m-1'>
                                                    <span className="text-sm font-normal text-gray-900">{grade.MFI}</span>
                                                </Badge>
                                            </Badge>
                                            <Badge variant="secondary" className='bg-gradient-to-b from-[#C5D5FF] to-[#EBF1FF] border-1 border-[#000000] text-white shadow-lg'>
                                                <Lightbulb className="mr-1 h-4 w-4 text-purple-400" />
                                                <span className="text-sm font-normal text-gray-900">Density –</span>
                                                <Badge className='bg-white border-1 border-[#000000] text-black shadow-lg m-1'>
                                                    <span className="text-sm font-normal text-gray-900">{grade.DENSITY}</span>
                                                </Badge>
                                            </Badge>
                                        </div>
                                        <div>
                                            <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                                                <Microscope className="h-5 w-5 text-purple-500" />
                                                <span className='text-[#F36F21]'>Special Characteristics</span>
                                            </h3>
                                            <p className="text-base text-black mt-1">{grade.SPECIAL_CHARACTERISTICS}</p>
                                        </div>
                                        <div>
                                            <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                                                <Tags className="h-5 w-5 text-orange-500" />
                                                <span className='text-[#F36F21]'>Grade Application</span>
                                            </h3>
                                            <p className="text-base text-black mt-1">{grade.GRADE_APPLICATION}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-20 text-xl text-gray-400">
                            No grades found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GradesPage;