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
    MFI?: string;
    DENSITY?: string;
    SPECIAL_CHARACTERISTICS?: string;
    GRADE_APPLICATION?: string;
    TECHNOLOGY?: string;
    TECHNICAL_SPECIFICATION?: string;
}

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
    "Aromatics & Chemicals": Pipette,
};

const GradesPage = () => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
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

    // Initialize filters from URL on initial load
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

    // Fetch grades with all filters
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

    const removeFilter = (type: keyof SearchFilters, value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            if (type === 'interestArea' || type === 'characteristics') {
                newFilters[type] = (newFilters[type] as string[]).filter(item => item !== value);
            } else {
                newFilters[type] = ''; 
            }
            return newFilters;
        });
    };

    if (loading && isInitialLoad) return <div className="text-center py-20 text-xl font-semibold text-white">Loading Products & Grades...</div>;
    if (loading && !isInitialLoad) return <div className="text-center py-20 text-xl font-semibold text-white">Updating Products & Grades...</div>;
    if (error) return <div className="text-center py-20 text-red-600 font-bold">Error: {error}</div>;

    return (
        // 1. TIGHT TOP PADDING (pt-2 md:pt-4) to remove excess blank space below the navbar
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pt-2 md:pt-4 pb-6 text-white flex flex-col h-screen overflow-hidden">
            
            {/* Dynamic Header */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-2 text-center tracking-tight text-white drop-shadow-md">
                {filters.product ? `Matching ${filters.product} Grades` : 'Matching Polymer & Chemical Grades'}
            </h1>
            
            <p className="text-center text-gray-300 text-sm sm:text-base md:text-lg mb-3">
                {grades.length > 0 ? `Showing ${grades.length} grades found` : 'No grades found matching criteria'}
            </p>

            {/* Filter Pills */}
            <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 z-10 relative">
                {filters.product && (
                    <span className="flex items-center bg-blue-100 text-blue-800 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-md cursor-pointer transition-colors"
                          onClick={() => removeFilter('product', filters.product)}>
                        Product: {filters.product} <X className="ml-1.5 h-3.5 w-3.5" />
                    </span>
                )}
                {filters.subCategory && (
                    <span className="flex items-center bg-blue-100 text-blue-800 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-md cursor-pointer transition-colors"
                          onClick={() => removeFilter('subCategory', filters.subCategory)}>
                        Sub-Cat: {filters.subCategory} <X className="ml-1.5 h-3.5 w-3.5" />
                    </span>
                )}
                {filters.sector && (
                    <span className="flex items-center bg-green-100 text-green-800 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-md cursor-pointer transition-colors"
                          onClick={() => removeFilter('sector', filters.sector)}>
                        Sector: {filters.sector} <X className="ml-1.5 h-3.5 w-3.5" />
                    </span>
                )}
                {filters.subSector && (
                    <span className="flex items-center bg-green-100 text-green-800 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-md cursor-pointer transition-colors"
                          onClick={() => removeFilter('subSector', filters.subSector)}>
                        Sub-Sec: {filters.subSector} <X className="ml-1.5 h-3.5 w-3.5" />
                    </span>
                )}
                {filters.interestArea.map(filter => (
                    <span key={filter} className="flex items-center bg-white/95 text-gray-800 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-md cursor-pointer transition-colors"
                          onClick={() => removeFilter('interestArea', filter)}>
                        {filter} <X className="ml-1.5 h-3.5 w-3.5 text-gray-700" />
                    </span>
                ))}
                {filters.characteristics.map(filter => (
                    <span key={filter} className="flex items-center bg-gray-700 text-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-md cursor-pointer"
                          onClick={() => removeFilter('characteristics', filter)}>
                        {filter} <X className="ml-1.5 h-3.5 w-3.5 text-gray-300" />
                    </span>
                ))}
            </div>

            {/* Results Grid - Scrollable area */}
            <div className="flex-grow overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-6">
                    {grades.length > 0 ? (
                        grades.map((grade) => {
                            const ProductIcon = productIcons[grade.PRODUCT_NAME] || Package;
                            const isAromatics = grade.PRODUCT_NAME?.toLowerCase().includes('aromatic') || !!grade.TECHNOLOGY || !!grade.TECHNICAL_SPECIFICATION;

                            return (
                                <Card key={grade.GRADE_ID} className="overflow-hidden shadow-lg bg-white border border-gray-100 hover:shadow-xl transition-shadow rounded-2xl">
                                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-gray-100">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className='bg-gradient-to-b from-[#E3CBBE] to-[#FFFFFF] border-2 border-[#000000] text-black shadow-sm p-1 px-2.5'>
                                                <ProductIcon className="h-4 w-4 sm:h-5 sm:w-5 text-black mr-1.5" />
                                                <span className="text-xs sm:text-sm font-semibold text-gray-900">
                                                    {grade.PRODUCT_NAME}
                                                </span>
                                            </Badge>
                                            <Badge className='bg-gradient-to-b from-[#E3CBBE] to-[#FFFFFF] border border-[#000000] text-black shadow-sm'>
                                                <span className="text-xs sm:text-sm font-normal text-gray-900 flex items-center gap-1">
                                                    {isAromatics ? 'Product Code –' : 'Grade ID –'}
                                                    <Badge className='bg-white border border-[#000000] text-black shadow-xs px-1.5 py-0'>
                                                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                                                            {grade.GRADE_ID}
                                                        </span>
                                                    </Badge>
                                                </span>
                                            </Badge>
                                        </div>

                                        <Button 
                                            onClick={() => router.push(`/grade/${encodeURIComponent(grade.GRADE_ID)}`)}
                                            className="w-full sm:w-auto bg-gradient-to-b from-[#f36f21] to-[#ffd6be] hover:from-[#ff5a00] hover:to-[#ffb48a] text-[#00164E] font-bold rounded-xl h-10 px-5 text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
                                        >
                                            View Details
                                        </Button>
                                    </CardHeader>

                                    <CardContent className="space-y-3 p-4 sm:p-5">
                                        {/* Specification Badges */}
                                        <div className="flex flex-wrap gap-2">
                                            {grade.SECTOR_NAME && (
                                                <Badge className='bg-gradient-to-b from-[#C5D5FF] to-[#EBF1FF] border border-[#000000]/20 text-gray-900 shadow-xs'>
                                                    <span className="text-xs sm:text-sm font-normal">
                                                        Sector – <Badge className='bg-white text-black shadow-xs ml-1 px-1.5'>{grade.SECTOR_NAME}</Badge>
                                                    </span>
                                                </Badge>
                                            )}

                                            {isAromatics ? (
                                                /* AROMATICS: Technology Badge */
                                                grade.TECHNOLOGY && (
                                                    <Badge variant="secondary" className='bg-gradient-to-b from-[#C5D5FF] to-[#EBF1FF] border border-[#000000]/20 text-gray-900 shadow-xs'>
                                                        <Lightbulb className="mr-1 h-3.5 w-3.5 text-orange-500" />
                                                        <span className="text-xs sm:text-sm font-normal">
                                                            Technology – <Badge className='bg-white text-black shadow-xs ml-1 px-1.5'>{grade.TECHNOLOGY}</Badge>
                                                        </span>
                                                    </Badge>
                                                )
                                            ) : (
                                                /* POLYMERS: MFI & Density */
                                                <>
                                                    {grade.MFI && (
                                                        <Badge variant="secondary" className='bg-gradient-to-b from-[#C5D5FF] to-[#EBF1FF] border border-[#000000]/20 text-gray-900 shadow-xs'>
                                                            <Ruler className="mr-1 h-3.5 w-3.5 text-pink-500" />
                                                            <span className="text-xs sm:text-sm font-normal">MFI –</span>
                                                            <Badge className='bg-white text-black shadow-xs ml-1 px-1.5'>{grade.MFI}</Badge>
                                                        </Badge>
                                                    )}
                                                    {grade.DENSITY && (
                                                        <Badge variant="secondary" className='bg-gradient-to-b from-[#C5D5FF] to-[#EBF1FF] border border-[#000000]/20 text-gray-900 shadow-xs'>
                                                            <Lightbulb className="mr-1 h-3.5 w-3.5 text-purple-500" />
                                                            <span className="text-xs sm:text-sm font-normal">Density –</span>
                                                            <Badge className='bg-white text-black shadow-xs ml-1 px-1.5'>{grade.DENSITY}</Badge>
                                                        </Badge>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Technical Specification (Aromatics) OR Special Characteristics (Polymers) */}
                                        {/* {isAromatics ? (
                                            grade.TECHNICAL_SPECIFICATION && (
                                                <div className="pt-1">
                                                    <h3 className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-800 mb-0.5">
                                                        <Microscope className="h-4 w-4 text-purple-500" />
                                                        <span className='text-[#F36F21]'>Technical Specification</span>
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 pl-5">
                                                        {grade.TECHNICAL_SPECIFICATION}
                                                    </p>
                                                </div>
                                            )
                                        ) : (
                                            grade.SPECIAL_CHARACTERISTICS && (
                                                <div className="pt-1">
                                                    <h3 className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-800 mb-0.5">
                                                        <Microscope className="h-4 w-4 text-purple-500" />
                                                        <span className='text-[#F36F21]'>Special Characteristics</span>
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 pl-5">
                                                        {grade.SPECIAL_CHARACTERISTICS}
                                                    </p>
                                                </div>
                                            )
                                        )} */}

                                        {/* --- BULLETPROOF CARD SPECIFICATION / CHARACTERISTICS --- */}
{(() => {
    const techSpec = grade.TECHNICAL_SPECIFICATION || (grade as any).technical_specification;
    const specialChar = grade.SPECIAL_CHARACTERISTICS || (grade as any).special_characteristics;
    const displayText = techSpec || specialChar;

    if (!displayText) return null;

    return (
        <div className="pt-1">
            <h3 className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-800 mb-0.5">
                <Microscope className="h-4 w-4 text-purple-500" />
                <span className="text-[#F36F21]">
                    {isAromatics ? 'Technical Specification' : 'Special Characteristics'}
                </span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 pl-5">
                {displayText}
            </p>
        </div>
    );
})()}

                                        {/* Grade Application */}
                                        {grade.GRADE_APPLICATION && (
                                            <div className="pt-1">
                                                <h3 className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-800 mb-0.5">
                                                    <Tags className="h-4 w-4 text-orange-500" />
                                                    <span className='text-[#F36F21]'>Grade Application</span>
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 pl-5">
                                                    {grade.GRADE_APPLICATION}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-20 text-lg sm:text-xl text-gray-300">
                            No grades found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GradesPage;