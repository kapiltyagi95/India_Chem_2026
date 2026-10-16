"use client"

import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MultiItemCarouselProps {
  children: React.ReactNode[]
  itemsPerSlide: number
}

export function MultiItemCarousel({ children, itemsPerSlide }: MultiItemCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const totalSlides = Math.ceil(React.Children.count(children) / itemsPerSlide)

  const next = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides) // Loop forward
  }, [totalSlides])

  const prev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides) // Loop backward
  }, [totalSlides])

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {Array.from({ length: totalSlides }).map((_, slideIndex) => (
          <div key={slideIndex} className="w-full flex-shrink-0 flex gap-4">
            {React.Children.toArray(children).slice(
              slideIndex * itemsPerSlide,
              (slideIndex + 1) * itemsPerSlide
            )}
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
        onClick={prev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
        onClick={next}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div> 
  )
}
