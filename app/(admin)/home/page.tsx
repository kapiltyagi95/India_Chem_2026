'use client'


import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File, ArrowRight } from 'lucide-react';

// Mock data for petrochemical products
const products = [
  { id: 1, name: "Polyethylene", grades: ["HDPE", "LDPE", "LLDPE"], color: "bg-blue-100" },
  { id: 2, name: "Polypropylene", grades: ["Homopolymer", "Copolymer"], color: "bg-green-100" },
  { id: 3, name: "Polyvinyl Chloride", grades: ["Rigid PVC", "Flexible PVC"], color: "bg-yellow-100" },
  { id: 4, name: "Polystyrene", grades: ["GPPS", "HIPS"], color: "bg-red-100" },
  { id: 5, name: "Acrylonitrile Butadiene Styrene", grades: ["Injection Molding", "Extrusion"], color: "bg-purple-100" },
  { id: 6, name: "Polyethylene Terephthalate", grades: ["Bottle Grade", "Fiber Grade"], color: "bg-pink-100" },
];

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50"> {/* Light background color */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">India Chem 2026</h1>
        <p className="text-xl text-gray-500">Petrochemical Products Showcase</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className={`hover:shadow-lg transition-shadow rounded-lg ${product.color}`}> {/* Dynamic background color */}
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-800">
                <span>{product.name}</span>
                <File className="text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Available Grades:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.grades.map((grade, index) => (
                    <Badge key={index} variant="secondary">
                      {grade}
                    </Badge>
                  ))}
                </div>
              </div>
              <Link href={`/product/${product.id}`} passHref>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
