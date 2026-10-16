'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import Link from 'next/link'
import { toast } from "sonner"
import clsx from "clsx"

type FormValues = {
  name: string
  mobileNumber: string
  interest_Area: string
  Characterestics: string 
  product: string
  subCategory: string
  sector: string
  subSector: string
}

interface Suggestion {
  label: string;
  characteristics: string;
}

export default function Formpage() {
  const router = useRouter()

  const form = useForm<FormValues>({
    defaultValues: {
      name: "", mobileNumber: "", interest_Area: "", Characterestics: "", 
      product: "", subCategory: "", sector: "", subSector: "",
    }, mode: "onSubmit",
  })

  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [allGradesData, setAllGradesData] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('userEmail');
    }
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/getFilterOptions');
        if (!response.ok) return;
        const data = await response.json();
        setAllGradesData(data);
      } catch (error) {
        console.error("Failed to fetch filter options", error);
      }
    };
    fetchOptions();
  }, []);

  const { control, watch, formState: { errors }, setValue } = form
  
  // --- CASCADING DROPDOWN LOGIC ---
  const selectedProduct = watch("product");
  const selectedSubCategory = watch("subCategory");
  const selectedSector = watch("sector");
  const selectedSubSector = watch("subSector");

  const availableProducts = useMemo(() => {
    return Array.from(new Set(allGradesData.map(d => d.product_name).filter(Boolean))).sort();
  }, [allGradesData]);

  const availableSubCategories = useMemo(() => {
    const filtered = allGradesData.filter(d => !selectedProduct || d.product_name === selectedProduct);
    return Array.from(new Set(filtered.map(d => d.sub_category).filter(Boolean))).sort();
  }, [allGradesData, selectedProduct]);

  const availableSectors = useMemo(() => {
    const filtered = allGradesData.filter(d => 
      (!selectedProduct || d.product_name === selectedProduct) &&
      (!selectedSubCategory || d.sub_category === selectedSubCategory)
    );
    return Array.from(new Set(filtered.map(d => d.sector_name).filter(Boolean))).sort();
  }, [allGradesData, selectedProduct, selectedSubCategory]);

  const availableSubSectors = useMemo(() => {
    const filtered = allGradesData.filter(d => 
      (!selectedProduct || d.product_name === selectedProduct) &&
      (!selectedSubCategory || d.sub_category === selectedSubCategory) &&
      (!selectedSector || d.sector_name === selectedSector)
    );
    return Array.from(new Set(filtered.map(d => d.sub_sector).filter(Boolean))).sort();
  }, [allGradesData, selectedProduct, selectedSubCategory, selectedSector]);

  useEffect(() => {
    if (selectedSubCategory && !availableSubCategories.includes(selectedSubCategory)) setValue("subCategory", "");
  }, [availableSubCategories, selectedSubCategory, setValue]);

  useEffect(() => {
    if (selectedSector && !availableSectors.includes(selectedSector)) setValue("sector", "");
  }, [availableSectors, selectedSector, setValue]);

  useEffect(() => {
    if (selectedSubSector && !availableSubSectors.includes(selectedSubSector)) setValue("subSector", "");
  }, [availableSubSectors, selectedSubSector, setValue]);
  // ---------------------------------


  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [selectedInputValue, setSelectedInputValue] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);

  const interestAreaValue = watch("interest_Area")

  useEffect(() => {
    if (interestAreaValue === selectedInputValue || !interestAreaValue || interestAreaValue.length < 3) {
      setSuggestions([]); setLoadingSuggestions(false); return;
    }
    if (interestAreaValue !== selectedInputValue && selectedInputValue !== null) setSelectedInputValue(null);

    const timer = setTimeout(() => {
      if (interestAreaValue && interestAreaValue.length >= 3) fetchSuggestions(interestAreaValue)
      else setSuggestions([])
    }, 500)
    return () => clearTimeout(timer)
  }, [interestAreaValue, selectedInputValue])

  const fetchSuggestions = async (query: string) => {
    setLoadingSuggestions(true)
    try {
      const currentProduct = form.getValues("product") || "";
      const currentSubCategory = form.getValues("subCategory") || "";
      const currentSector = form.getValues("sector") || "";
      const currentSubSector = form.getValues("subSector") || "";

      const params = new URLSearchParams({
        query: query,
        ...(currentProduct && { product: currentProduct }),
        ...(currentSubCategory && { subCategory: currentSubCategory }),
        ...(currentSector && { sector: currentSector }),
        ...(currentSubSector && { subSector: currentSubSector })
      });

      const response = await fetch(`/api/getSuggestions?${params.toString()}`);
      if (!response.ok) { setSuggestions([]); return; }
      
      const data = await response.json();
      setSuggestions(data); 
    } catch (error) {
      console.error("Failed to fetch suggestions", error);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsContainerRef.current && !suggestionsContainerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [suggestionsContainerRef]);

  const extractGradeApplication = (suggestion: string): string => {
    const parts = suggestion.split(' - ');
    return parts.length > 0 ? parts[parts.length - 1].trim() : suggestion;
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setValue("interest_Area", suggestion.label, { shouldValidate: true });
    setValue("Characterestics", suggestion.characteristics);
    setSelectedInputValue(suggestion.label);
    setSuggestions([]);
    inputRef.current?.blur();
  }

  const onSubmit = async (values: FormValues) => {
    const toastId = toast.loading("Submitting form...", { description: "Please wait" })
    try {
      const response = await fetch('/api/saveform', {
        method: 'POST',
        body: JSON.stringify(values), 
      })

      if (!response.ok) throw new Error("Submission failed")
      
      const result = await response.json(); 

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userName', values.name);
        sessionStorage.setItem('rowId', result.id); 
      }

      toast.success("Form submitted successfully", { description: "Redirecting..." })
      setIsSubmitted(true);

      const gradeApplicationToSend = extractGradeApplication(values.interest_Area);

      const query = new URLSearchParams({
        interest_Area: gradeApplicationToSend,
        Characterestics: values.Characterestics || '',
        product: values.product || '',
        subCategory: values.subCategory || '',
        sector: values.sector || '',
        subSector: values.subSector || ''
      }).toString()

      setTimeout(() => router.replace(`/grade?${query}`), 500);
    } catch (error: any) {
      toast.error("Submission failed", { description: error.message })
    } finally {
      toast.dismiss(toastId)
    }
  }

  return (
    // Outer container takes full width, padding adjusted for mobile
    <div className="w-full min-h-screen flex items-start justify-center px-2 md:px-6 lg:px-8 pt-2 md:pt-4 pb-6 md:pb-8">
      <FormProvider {...form}>
        <form className="w-full space-y-6" onSubmit={form.handleSubmit(onSubmit, () => { toast.warning("Please fill all mandatory fields") })}>
          
          <div className="w-full p-4 sm:p-6 md:p-10 bg-white bg-opacity-30 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
            <CardHeader className="px-0 pt-0">
              {/* Responsive Text Sizing for the Header */}
              <CardTitle className="text-3xl md:text-5xl font-bold text-center text-white drop-shadow-md">
                Petrochemical Interest Form
              </CardTitle>
              <CardDescription className="text-center text-base md:text-lg text-orange-300 font-medium mt-2">
                Fields marked * are mandatory
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-0">
              {/* NAME & MOBILE */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex-1">
                  <FormField control={control} name="name" rules={{ required: "Name is required" }} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-base md:text-lg font-medium">Name *</FormLabel>
                      <FormControl><Input {...field} placeholder="Enter your full name" className={clsx("h-12 md:h-14 text-base md:text-lg", errors.name && "border-red-500 ring-red-500")} /></FormControl>
                    </FormItem>
                  )}/>
                </div>
                <div className="flex-1">
                  <FormField control={control} name="mobileNumber" rules={{ required: "Mobile number is required", pattern: { value: /^[6-9]\d{9}$/, message: "Enter valid 10-digit mobile number" } }} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-base md:text-lg font-medium">Mobile Number *</FormLabel>
                      <FormControl><Input {...field} placeholder="10-digit mobile number" maxLength={10} className={clsx("h-12 md:h-14 text-base md:text-lg", errors.mobileNumber && "border-red-500 ring-red-500")} /></FormControl>
                    </FormItem>
                  )}/>
                </div>
              </div>

              {/* DROPDOWN FILTERS */}
              <div className="p-4 md:p-6 border border-white/30 rounded-xl bg-white/10 shadow-inner">
                <h3 className="text-white text-lg md:text-xl font-bold mb-4 flex items-center drop-shadow-sm">
                  Search Filters 
                </h3>
                {/* 1 col on mobile, 2 on tablet, 4 on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  
                  <FormField control={control} name="product" render={({ field }) => (
                    <FormItem><FormLabel className="text-white text-sm md:text-base font-medium">Product</FormLabel><FormControl>
                        <select {...field} className="flex h-12 w-full rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-sm md:text-base text-slate-900 focus:ring-2 focus:ring-[#f36f21]">
                          <option value="">All Products...</option>{availableProducts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </FormControl></FormItem>
                  )}/>
                  
                  <FormField control={control} name="subCategory" render={({ field }) => (
                    <FormItem><FormLabel className="text-white text-sm md:text-base font-medium">Sub-Category</FormLabel><FormControl>
                        <select {...field} disabled={availableSubCategories.length === 0} className="flex h-12 w-full rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-sm md:text-base text-slate-900 disabled:opacity-60 focus:ring-2 focus:ring-[#f36f21]">
                          <option value="">All Sub-Categories...</option>{availableSubCategories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </FormControl></FormItem>
                  )}/>
                  
                  <FormField control={control} name="sector" render={({ field }) => (
                    <FormItem><FormLabel className="text-white text-sm md:text-base font-medium">Sector</FormLabel><FormControl>
                        <select {...field} disabled={availableSectors.length === 0} className="flex h-12 w-full rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-sm md:text-base text-slate-900 disabled:opacity-60 focus:ring-2 focus:ring-[#f36f21]">
                          <option value="">All Sectors...</option>{availableSectors.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </FormControl></FormItem>
                  )}/>
                  
                  <FormField control={control} name="subSector" render={({ field }) => (
                    <FormItem><FormLabel className="text-white text-sm md:text-base font-medium">Sub-Sector</FormLabel><FormControl>
                        <select {...field} disabled={availableSubSectors.length === 0} className="flex h-12 w-full rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-sm md:text-base text-slate-900 disabled:opacity-60 focus:ring-2 focus:ring-[#f36f21]">
                          <option value="">All Sub-Sectors...</option>{availableSubSectors.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </FormControl></FormItem>
                  )}/>

                </div>
              </div>

              {/* APPLICATION SEARCH */}
              <div className="w-full">
                <FormField control={control} name="interest_Area" render={({ field }) => (
                    <FormItem className="relative" ref={suggestionsContainerRef}>
                      <FormLabel className="text-white text-base md:text-lg font-medium">Products / Application Search</FormLabel>
                      <FormControl><Input {...field} ref={inputRef} placeholder="Furniture, Toys, Packaging etc." className="h-12 md:h-14 text-base md:text-lg" /></FormControl>
                      {loadingSuggestions && <p className="text-orange-300 text-sm mt-1 font-medium">Searching...</p>}
                      {suggestions.length > 0 && interestAreaValue !== selectedInputValue && (
                        <ul className="absolute z-50 bg-white border border-gray-200 w-full rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                          {suggestions.map((s, i) => (
                            <li key={i} onClick={() => handleSuggestionClick(s)} className="p-3 md:p-4 hover:bg-orange-50 cursor-pointer text-sm md:text-base border-b last:border-b-0 transition-colors">
                              {s.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </FormItem>
                  )}
                />
              </div>

            </CardContent>

             {/* BUTTONS: Stack on Mobile (flex-col-reverse), Side-by-side on larger screens (sm:flex-row) */}
             {/* <CardFooter className="mt-8 md:mt-12 px-0 flex flex-col-reverse sm:flex-row justify-center gap-4 md:gap-6">
                
                <Link href="/" className="w-full sm:w-auto">
                    <div className="bg-white/80 hover:bg-white w-full sm:w-[200px] md:w-[280px] h-[60px] md:h-[80px] flex items-center justify-center rounded-2xl shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 border-2 border-transparent hover:border-[#002480]">
                        <p className="font-bold text-[#002480] text-xl md:text-2xl">Back</p>
                    </div>
                </Link>

                <button type="submit" disabled={isSubmitted} className="w-full sm:w-auto">
                    <div className={clsx(
                        "w-full sm:w-[200px] md:w-[280px] h-[60px] md:h-[80px] flex items-center justify-center rounded-2xl shadow-lg cursor-pointer transition-all active:scale-95",
                        isSubmitted ? "bg-[#E5E0E0] cursor-not-allowed" : "bg-gradient-to-b from-[#f36f21] to-[#ffd6be] hover:scale-105 border-2 border-transparent hover:border-[#002480]"
                    )}>
                        <p className={clsx("font-bold text-xl md:text-2xl", isSubmitted ? "text-white" : "text-[#002480]")}>
                          {isSubmitted ? "Submitting..." : "Submit"}
                        </p>
                    </div>
                </button>

            </CardFooter> */}
            <CardFooter className="mt-8 md:mt-12 px-0 w-full flex flex-col-reverse md:flex-row items-center justify-center gap-3 md:gap-6">
    
    {/* Back Button */}
    <Link href="/" className="w-full md:w-auto flex justify-center">
        <div className="bg-white/80 hover:bg-white w-full md:w-[240px] lg:w-[280px] h-[54px] md:h-[72px] flex items-center justify-center rounded-xl md:rounded-2xl shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 border-2 border-transparent hover:border-[#002480]">
            <p className="font-bold text-[#002480] text-lg md:text-2xl">Back</p>
        </div>
    </Link>

    {/* Submit Button */}
    <button type="submit" disabled={isSubmitted} className="w-full md:w-auto flex justify-center">
        <div className={clsx(
            "w-full md:w-[240px] lg:w-[280px] h-[54px] md:h-[72px] flex items-center justify-center rounded-xl md:rounded-2xl shadow-lg cursor-pointer transition-all active:scale-95",
            isSubmitted ? "bg-[#E5E0E0] cursor-not-allowed" : "bg-gradient-to-b from-[#f36f21] to-[#ffd6be] hover:scale-105 border-2 border-transparent hover:border-[#002480]"
        )}>
            <p className={clsx("font-bold text-lg md:text-2xl", isSubmitted ? "text-white" : "text-[#002480]")}>
              {isSubmitted ? "Submitting..." : "Submit"}
            </p>
        </div>
    </button>

</CardFooter>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}