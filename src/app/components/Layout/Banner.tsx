'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
  stock: number;
}

interface ProductBannerProps {
  products: Product[];
}

export default function ProductBanner({ products }: ProductBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying || products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === products.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, products.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    const newIndex = currentIndex === products.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  if (!products || products.length === 0) {
    return null;
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="relative w-full h-96 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-white"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* Left Side - Product Info */}
          <div className="flex-1 text-black z-10">
            <div className="max-w-lg">
              {/* Category Badge */}
              <span className="inline-block bg-white bg-opacity-20 text-black text-sm font-semibold px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
                {currentProduct.category}
              </span>
              
              {/* Product Name */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {currentProduct.name}
              </h1>
              
              {/* Description */}
              <p className="text-lg md:text-xl text-gray-800 mb-6 leading-relaxed">
                {currentProduct.description}
              </p>
              
              {/* Price and Stock */}
              <div className="flex items-center gap-6 mb-8">
                <div className="text-3xl font-bold text-yellow-600">
                  ${currentProduct.price.toFixed(2)}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  currentProduct.stock > 10 
                    ? 'bg-green-500 text-white' 
                    : currentProduct.stock > 0 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-red-500 text-white'
                }`}>
                  {currentProduct.stock > 0 
                    ? `${currentProduct.stock} in stock` 
                    : 'Out of stock'
                  }
                </div>
              </div>
              
              {/* CTA Button */}
              <Link
                href={`/products/${currentProduct.id}`}
                className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View Product →
              </Link>
            </div>
          </div>

          {/* Right Side - Product Image */}
          <div className="flex-1 flex justify-center items-center">
            <div className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-white border-opacity-30 shadow-2xl backdrop-blur-sm">
              {currentProduct.imageUrl ? (
                <Image
                  src={currentProduct.imageUrl}
                  alt={currentProduct.name}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              ) : (
                <div className="w-full h-full bg-white bg-opacity-20 flex items-center justify-center text-black text-6xl font-bold">
                  {currentProduct.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {products.length > 1 && (
        <>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-black p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            aria-label="Next product"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {products.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Floating Elements for Visual Interest */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white bg-opacity-10 rounded-full animate-bounce delay-500"></div>
    </div>
  );
}