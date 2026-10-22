'use client'; 

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Download, Home, ArrowLeft, Lightbulb, Ruler, Microscope, Tags, Mail, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import React from 'react';

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
    tds_url?: string;
}

const GradeDetailPage = ({ params }: { params: Promise< { gradeId: string } >}) => {
    const { gradeId } = React.use(params);
    const [grade, setGrade] = useState<Grade | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Modal State
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Effect for fetching grade details
    useEffect(() => {
        if (!gradeId) return;

        const fetchGradeDetails = async () => {
            setLoadingDetails(true);
            setError(null);
            try {
                const response = await fetch(`/api/getGradeById?gradeId=${gradeId}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const result: Grade = await response.json();
                setGrade(result);
            } catch (err: any) {
                setError("Error fetching grade details.");
                toast.error(`Error loading grade details: ${err.message || "Something went wrong."}`);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchGradeDetails();
    }, [gradeId]);

    // MAIN FUNCTION: Triggered when user submits their email in the modal
    const handleEmailSubmit = async () => {
        if (!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (!grade) {
            toast.error("Grade details not loaded yet.");
            return;
        }

        setIsSending(true);
        const toastId = toast.loading("Processing your request...");

        let userName: string | null = 'Valued Customer';
        let rowId: string | null = null; 
        
        if (typeof window !== 'undefined') {
            userName = sessionStorage.getItem('userName') || 'Valued Customer';
            rowId = sessionStorage.getItem('rowId'); 
        }

        try {
            // 1. SAVE THE EMAIL TO THE DATABASE USING THE EXACT ID
            await fetch('/api/updateUserEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: rowId, 
                    name: userName !== 'Valued Customer' ? userName : '',
                    email: emailInput
                })
            });

            // 2. PREPARE THE TDS PDF
            const tdsUrl = grade.tds_url;
            if (!tdsUrl) {
                throw new Error("TDS Document is not available for this grade.");
            }

            toast.loading("Fetching PDF Document...", { id: toastId });
            const pdfResponse = await fetch(`/api/proxy-pdf?url=${encodeURIComponent(tdsUrl)}`);
            if (!pdfResponse.ok) throw new Error(`Failed to download PDF.`);
            
            const pdfBlob = await pdfResponse.blob();

            // 3. CONVERT TO BASE64
            const reader = new FileReader();
            reader.readAsDataURL(pdfBlob);

            await new Promise<void>((resolve, reject) => {
                reader.onloadend = async () => {
                    try {
                        const base64data = reader.result as string;
                        const pdfBase64 = base64data.split(',')[1]; 

                        const filenameMatch = tdsUrl.match(/\/([^\/?#]+)[\?#]?$/);
                        const fileName = filenameMatch ? filenameMatch[1] : `${grade.PRODUCT_NAME}_${grade.GRADE_ID}_TDS.pdf`;

                        toast.loading("Sending Email...", { id: toastId });
                        
                        const isAromatics = grade.PRODUCT_NAME?.toLowerCase().includes('aromatic') || !!grade.TECHNOLOGY;
                        const productLabel = isAromatics ? 'Product' : 'Polymer Grade';

                        const mailSubject = `IOCL TDS for ${productLabel}: ${grade.PRODUCT_NAME} - ${grade.GRADE_ID}`;
                        const mailBody = `
                            <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                                <div style="text-align: center; margin-bottom: 20px;">
                                    <h2 style="color: #002480; margin: 0; padding-bottom: 10px; border-bottom: 1px solid #eee;">Technical Data Sheet</h2>
                                </div>
                                <p>Dear ${userName},</p>
                                <p>Thank you for reaching out to us. We appreciate your interest in our products.</p>
                                <p>Please find the Technical Data Sheet (TDS) for <b>${grade.PRODUCT_NAME} - ${grade.GRADE_ID}</b> conveniently attached to this email.</p>
                                <p>Should you require any further information, please do not hesitate to contact our team.</p>
                                <p style="margin-top: 30px;">Best regards,</p>
                                <p style="margin: 0; font-weight: bold; color: #002480;">The IndianOil Team</p>
                            </div>
                        `;

                        const emailPayload = {
                            MailFrom: "iocladmin@indianoil.in",
                            MailTo: [emailInput],
                            MailCCTo: "",
                            MailBCCTo: ["yadavsp@indianoil.in", "tyagikapil@indianoil.in"],
                            MailSubject: mailSubject,
                            MailBody: mailBody,
                            Attachments: [{ FileName: fileName, ContentBase64: pdfBase64 }],
                        };

                        const sendEmailResponse = await fetch('/api/sendEmail', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(emailPayload),
                        });

                        if (!sendEmailResponse.ok) {
                            const errorData = await sendEmailResponse.json();
                            const message = errorData.cause ? `${errorData.error} (${errorData.cause})` : errorData.error;
                            throw new Error(message || "Failed to send email via backend.");
                        }

                        toast.success(`TDS successfully sent to ${emailInput}!`, { id: toastId });
                        setShowEmailModal(false); 
                        setEmailInput(''); 
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                };
                reader.onerror = (error) => reject(error);
            });

        } catch (err: any) {
            console.error('Failed process:', err);
            toast.error(err.message || "An error occurred while sending the email.", { id: toastId });
        } finally {
            setIsSending(false);
        }
    };

    if (loadingDetails) return <div className="text-center py-20 text-xl font-semibold text-white">Loading Grade Details...</div>;
    if (error) return <div className="text-center py-20 text-red-600 font-bold">Error: {error}</div>;
    if (!grade) return <div className="text-center py-20 text-xl font-semibold text-white">Grade not found.</div>;

    const downloadLink = grade.tds_url || `https://iocl.com/downloads/${grade.GRADE_ID}.pdf`;
    
    // Check if current item is Aromatics & Chemicals
    const isAromatics = grade.PRODUCT_NAME?.toLowerCase().includes('aromatic') || !!grade.TECHNOLOGY || !!grade.TECHNICAL_SPECIFICATION;

    return (
        <div className="w-full relative flex flex-col items-center justify-start px-2 sm:px-4 md:px-6 pt-2 md:pt-4 pb-8 min-h-screen">
            
            {/* --- EMAIL POPUP MODAL --- */}
            {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => !isSending && setShowEmailModal(false)} 
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                            disabled={isSending}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-[#002480] mb-2">Send Document</h2>
                        <p className="text-gray-600 mb-6 text-sm">
                            Enter your email address to receive the Technical Data Sheet for <b>{grade.GRADE_ID}</b>.
                        </p>
                        
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="your.email@example.com"
                            disabled={isSending}
                            className="w-full border border-gray-300 rounded-xl p-3 sm:p-4 mb-6 focus:ring-2 focus:ring-[#f36f21] outline-none text-black text-base"
                        />
                        
                        <Button
                            onClick={handleEmailSubmit}
                            disabled={isSending || !emailInput}
                            className="w-full bg-gradient-to-b from-[#f36f21] to-[#ffd6be] hover:from-[#ff5a00] hover:to-[#ffb48a] text-[#00164E] font-bold text-base sm:text-lg h-12 sm:h-14 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                        >
                            {isSending ? "Sending Document..." : "Send to Email"}
                        </Button>
                    </div>
                </div>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-5 text-center drop-shadow-md">
                Grade Details
            </h1>
            
            {/* Outer Glass Card */}
            <div className="w-full max-w-6xl bg-white bg-opacity-30 backdrop-blur-lg rounded-2xl shadow-2xl relative z-10 p-2 sm:p-4 md:p-6 lg:p-8 border border-white border-opacity-20">
                
                <div className="relative flex flex-col lg:flex-row rounded-xl shadow-2xl overflow-hidden bg-white">
                    
                    {/* DETAILS LEFT SECTION */}
                    <div className="w-full lg:w-2/3 p-4 sm:p-6 md:p-8 bg-white flex flex-col justify-between">
                        <div>
                            {/* Header Badges */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <Badge className='bg-gradient-to-b from-[#E3CBBE] to-[#FFFFFF] border-2 border-[#000000] text-black shadow-md p-1 px-2.5'>
                                        <span className="text-xs sm:text-sm font-semibold text-gray-900">{grade.PRODUCT_NAME}</span>
                                    </Badge>
                                    <Badge className='bg-gradient-to-b from-[#E3CBBE] to-[#FFFFFF] border border-[#000000] text-black shadow-md'>
                                        <span className="text-xs sm:text-sm font-normal text-gray-900 flex items-center gap-1">
                                            {isAromatics ? 'Product Code –' : 'Grade ID –'}
                                            <Badge className='bg-white border border-[#000000] text-black shadow-sm px-1.5 py-0'>
                                                <span className="text-xs sm:text-sm font-bold text-gray-900">{grade.GRADE_ID}</span>
                                            </Badge>
                                        </span>
                                    </Badge>
                                </div>
                            </div>

                            <div className='h-0.5 bg-[#002480]/20 my-3 sm:my-4'></div>

                            {/* --- CONDITIONAL SPECIFICATIONS (MFI & Density vs Technology) --- */}
                            <div className="flex flex-wrap gap-2 sm:gap-3 my-3 sm:my-4">
                                {grade.SECTOR_NAME && (
                                    <Badge className='bg-gradient-to-b from-[#C5D5FF] to-[#EBF1FF] border border-[#000000]/30 text-gray-900 shadow-sm'>
                                        <span className="text-xs sm:text-sm font-normal">
                                            Sector – <Badge className='bg-white border border-[#000000]/20 text-black shadow-sm ml-1 px-1.5'>{grade.SECTOR_NAME}</Badge>
                                        </span>
                                    </Badge>
                                )}

                                {isAromatics ? (
                                    /* AROMATICS: Technology Badge */
                                    grade.TECHNOLOGY && (
                                        <Badge variant="secondary" className='bg-gradient-to-b from-[#C5D5FF] to-[#EBF1FF] border border-[#000000]/30 text-gray-900 shadow-sm'>
                                            <Lightbulb className="mr-1 h-3.5 w-3.5 text-orange-500" />
                                            <span className="text-xs sm:text-sm font-normal">
                                                Technology – <Badge className='bg-white border border-[#000000]/20 text-black shadow-sm ml-1 px-1.5'>{grade.TECHNOLOGY}</Badge>
                                            </span>
                                        </Badge>
                                    )
                                ) : (
                                    /* POLYMERS: MFI & Density Badges */
                                    <>
                                        {grade.MFI && (
                                            <Badge variant="secondary" className='bg-gradient-to-b from-[#C5D5FF] to-[#EBF1FF] border border-[#000000]/30 text-gray-900 shadow-sm'>
                                                <Ruler className="mr-1 h-3.5 w-3.5 text-pink-500" />
                                                <span className="text-xs sm:text-sm font-normal">
                                                    MFI – <Badge className='bg-white border border-[#000000]/20 text-black shadow-sm ml-1 px-1.5'>{grade.MFI}</Badge>
                                                </span>
                                            </Badge>
                                        )}
                                        {grade.DENSITY && (
                                            <Badge variant="secondary" className='bg-gradient-to-b from-[#C5D5FF] to-[#EBF1FF] border border-[#000000]/30 text-gray-900 shadow-sm'>
                                                <Lightbulb className="mr-1 h-3.5 w-3.5 text-purple-500" />
                                                <span className="text-xs sm:text-sm font-normal">
                                                    Density – <Badge className='bg-white border border-[#000000]/20 text-black shadow-sm ml-1 px-1.5'>{grade.DENSITY}</Badge>
                                                </span>
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className='h-0.5 bg-[#002480]/20 my-3 sm:my-4'></div>

                            {/* --- CONDITIONAL SECTION: Special Characteristics OR Technical Specification ---
                            {isAromatics ? (
                                grade.TECHNICAL_SPECIFICATION && (
                                    <>
                                        <div className="my-3 sm:my-4">
                                            <h3 className="flex items-center gap-2 font-bold text-sm sm:text-base text-gray-800 mb-1">
                                                <Microscope className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                                                <span className='text-[#F36F21]'>Technical Specification</span>
                                            </h3>
                                            <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed pl-6 whitespace-pre-line">
                                                {grade.TECHNICAL_SPECIFICATION}
                                            </p>
                                        </div>
                                        <div className='h-0.5 bg-[#002480]/20 my-3 sm:my-4'></div>
                                    </>
                                )
                            ) : (
                                grade.SPECIAL_CHARACTERISTICS && (
                                    <>
                                        <div className="my-3 sm:my-4">
                                            <h3 className="flex items-center gap-2 font-bold text-sm sm:text-base text-gray-800 mb-1">
                                                <Microscope className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                                                <span className='text-[#F36F21]'>Special Characteristics</span>
                                            </h3>
                                            <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed pl-6">
                                                {grade.SPECIAL_CHARACTERISTICS}
                                            </p>
                                        </div>
                                        <div className='h-0.5 bg-[#002480]/20 my-3 sm:my-4'></div>
                                    </>
                                )
                            )} */}

    {/* --- 1. TECHNICAL SPECIFICATION (Displays if present) --- */}
{(() => {
    const techSpec = grade.TECHNICAL_SPECIFICATION || (grade as any).technical_specification;
    if (!techSpec) return null;

    return (
        <>
            <div className="my-3 sm:my-4">
                <h3 className="flex items-center gap-2 font-bold text-sm sm:text-base text-gray-800 mb-1">
                    <Microscope className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    <span className="text-[#F36F21]">Technical Specification</span>
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed pl-6 whitespace-pre-line">
                    {techSpec}
                </p>
            </div>
            <div className="h-0.5 bg-[#002480]/20 my-3 sm:my-4"></div>
        </>
    );
})()}

{/* --- 2. SPECIAL CHARACTERISTICS (Displays if present) --- */}
{(() => {
    const specialChar = grade.SPECIAL_CHARACTERISTICS || (grade as any).special_characteristics;
    if (!specialChar) return null;

    return (
        <>
            <div className="my-3 sm:my-4">
                <h3 className="flex items-center gap-2 font-bold text-sm sm:text-base text-gray-800 mb-1">
                    <Microscope className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                    <span className="text-[#F36F21]">Special Characteristics</span>
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed pl-6 whitespace-pre-line">
                    {specialChar}
                </p>
            </div>
            <div className="h-0.5 bg-[#002480]/20 my-3 sm:my-4"></div>
        </>
    );
})()}

{/* --- 3. GRADE APPLICATION (Displays if present) --- */}
{(() => {
    const appText = grade.GRADE_APPLICATION || (grade as any).grade_application;
    if (!appText) return null;

    return (
        <div className="my-3 sm:my-4">
            <h3 className="flex items-center gap-2 font-bold text-sm sm:text-base text-gray-800 mb-1">
                <Tags className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                <span className="text-[#F36F21]">Grade Application</span>
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed pl-6 whitespace-pre-line">
                {appText}
            </p>
        </div>
    );
})()}

                            {/* Grade Application (Common to both) */}
                            {/* {grade.GRADE_APPLICATION && (
                                <div className="my-3 sm:my-4">
                                    <h3 className="flex items-center gap-2 font-bold text-sm sm:text-base text-gray-800 mb-1">
                                        <Tags className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                                        <span className='text-[#F36F21]'>Application</span>
                                    </h3>
                                    <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed pl-6">
                                        {grade.GRADE_APPLICATION}
                                    </p>
                                </div>
                            )} */}
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-100 mt-4">
                            <Button 
                                onClick={() => router.push('/')} 
                                className="w-full sm:w-auto flex-1 bg-gradient-to-b from-[#f36f21] to-[#ffd6be] hover:from-[#ff5a00] hover:to-[#ffb48a] text-[#00164E] font-bold rounded-xl flex items-center justify-center h-11 sm:h-12 px-4 text-sm sm:text-base shadow-sm transition-transform active:scale-95"
                            >
                                <Home className="mr-1.5 h-4 w-4" /> Home
                            </Button>

                            <Button 
                                onClick={() => router.back()} 
                                className="w-full sm:w-auto flex-1 bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 rounded-xl flex items-center justify-center h-11 sm:h-12 px-4 text-sm sm:text-base shadow-sm transition-transform active:scale-95"
                            >
                                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Results
                            </Button>

                            <Button
                                onClick={() => setShowEmailModal(true)}
                                className="w-full sm:w-auto flex-1 bg-gradient-to-b from-[#1E90FF] to-[#87CEEB] text-[#00164E] font-bold hover:opacity-95 rounded-xl flex items-center justify-center h-11 sm:h-12 px-4 text-sm sm:text-base shadow-sm transition-transform active:scale-95"
                                disabled={!grade || loadingDetails}
                            >
                                <Mail className="mr-1.5 h-4 w-4" /> Send Mail
                            </Button>
                        </div>
                    </div>

                    {/* QR CODE RIGHT SECTION */}
                    <div className="w-full lg:w-1/3 bg-gradient-to-br from-orange-400 to-red-500 p-6 sm:p-8 flex flex-col items-center justify-center text-white text-center">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 drop-shadow-sm">Scan to Download TDS</h2>
                        
                        <div className="bg-white p-3 rounded-2xl shadow-xl mb-4 transition-transform hover:scale-105">
                            <QRCodeSVG 
                                value={downloadLink} 
                                size={160} 
                                className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
                                level="H" 
                            />
                        </div>
                        
                        <p className="text-xs sm:text-sm font-medium leading-relaxed max-w-xs opacity-95">
                            Point your mobile camera at the QR code to instantly download the Technical Data Sheet.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GradeDetailPage;