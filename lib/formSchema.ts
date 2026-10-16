import * as zod from "zod";
export const formSchema = zod.object({
    name: zod.string().min(2, { message: "Name must be at least two characters" }),
    mobileNumber: zod.string().min(10, { message: "Mobile Number 10 digit is required" }),
    interest_Area: zod.string().optional(),
    product: zod.string().optional(),
    subCategory: zod.string().optional(),
    sector: zod.string().optional(),
    subSector: zod.string().optional(),
});