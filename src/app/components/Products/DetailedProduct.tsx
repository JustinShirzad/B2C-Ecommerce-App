'use client';

import { Product } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DetailedProductProps {
  product: Product;
}

export function DetailedProduct({ product }: DetailedProductProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const maxQuantity = Math.min(product.stock, 10);
  
  const handleAddToCart = async () => {
    if (product.stock === 0) return;
    
    setIsAddingToCart(true);
    
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // If user is not authenticated, redirect to login
        if (response.status === 401) {
          router.push(`/account`);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to add to cart');
      }
      
      // Success - redirect to cart page
      router.push('/cart');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('There was a problem adding this item to your cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">Main</Link>
        <span className="mx-2">/</span>
        <Link href={`/categories/${product.category}`} className="hover:text-blue-600">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="rounded-lg overflow-hidden bg-gray-100 shadow-sm">
          <img
            src={product.imageUrl || "/placeholder-product.png"}
            alt={product.name}
            className="w-full h-auto object-cover"
            style={{ maxHeight: "500px" }}
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {product.category}
            </span>
          </div>
          
          <div className="mb-6">
            <span className="text-3xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Description:</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Availability</h3>
            {product.stock > 0 && (
              <p className="text-green-600 flex items-center">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                In Stock
              </p>
            )}
            {product.stock === 0 && (
              <p className="text-red-600 flex items-center">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
                Out of Stock
              </p>
            )}
          </div>

          {/* Add to Cart section */}
          <div className="mt-auto">
            <div className="flex items-center gap-4">
              <div className="w-24">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <select
                  id="quantity"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={product.stock === 0 || isAddingToCart}
                >
                  {[...Array(maxQuantity)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                  className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                    product.stock > 0 && !isAddingToCart
                      ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isAddingToCart 
                    ? "Adding to Cart..." 
                    : product.stock > 0 
                      ? "Add to Cart" 
                      : "Out of Stock"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs - Could expand later */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <a href="#" className="py-2 px-4 border-b-2 border-blue-500 text-blue-600 font-medium">Details</a>
          </nav>
        </div>
        <div className="py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <dl className="space-y-3">
                <div className="flex">
                  <dt className="w-1/3 text-sm font-medium text-gray-500">Category</dt>
                  <dd className="w-2/3 text-sm text-gray-900">{product.category}</dd>
                </div>
                <div className="flex">
                  <dt className="w-1/3 text-sm font-medium text-gray-500">Product ID</dt>
                  <dd className="w-2/3 text-sm text-gray-900">{product.id}</dd>
                </div>
                <div className="flex">
                  <dt className="w-1/3 text-sm font-medium text-gray-500">Stock</dt>
                  <dd className="w-2/3 text-sm text-gray-900">{product.stock} units</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}