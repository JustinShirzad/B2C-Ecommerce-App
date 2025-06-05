'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutProps {
    cartId: string;
    cartTotal: number;
    itemCount: number;
    cartItems?: Array<{
        id: string;
        quantity: number;
        product: {
            id: string;
            name: string;
            price: number;
            imageUrl: string | null;
        };
    }>;
}

export function Checkout({ cartId, cartTotal, itemCount, cartItems = [] }: CheckoutProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form data state
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Australia', // Default to Australia
        phone: '',
        email: '',
    });

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        nameOnCard: '',
        expiryDate: '',
        cvv: '',
    });

    // Validation state
    const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});
    const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

    // Handle shipping form input changes
    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when user types
        if (shippingErrors[name]) {
            setShippingErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle payment form input changes
    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Format card number with spaces
        if (name === 'cardNumber') {
            const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            setPaymentInfo(prev => ({ ...prev, [name]: formatted }));
        }
        // Format expiry date
        else if (name === 'expiryDate') {
            let formatted = value.replace(/\D/g, '');
            if (formatted.length > 2) {
                formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}`;
            }
            setPaymentInfo(prev => ({ ...prev, [name]: formatted }));
        } else {
            setPaymentInfo(prev => ({ ...prev, [name]: value }));
        }

        // Clear error for this field
        if (paymentErrors[name]) {
            setPaymentErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Validate shipping form
    const validateShippingForm = () => {
        const errors: Record<string, string> = {};

        if (!shippingInfo.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }

        if (!shippingInfo.addressLine1.trim()) {
            errors.addressLine1 = 'Address is required';
        }

        if (!shippingInfo.city.trim()) {
            errors.city = 'City is required';
        }

        if (!shippingInfo.state.trim()) {
            errors.state = 'State is required';
        }

        if (!shippingInfo.postalCode.trim()) {
            errors.postalCode = 'Postal code is required';
        } else if (!/^\d{4}$/.test(shippingInfo.postalCode)) {
            // Australian postcodes are 4 digits
            errors.postalCode = 'Australian postcodes must be 4 digits';
        }

        if (!shippingInfo.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(shippingInfo.phone.replace(/\D/g, ''))) {
            errors.phone = 'Invalid phone number format';
        }

        if (!shippingInfo.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
            errors.email = 'Invalid email format';
        }

        setShippingErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate payment form
    const validatePaymentForm = () => {
        const errors: Record<string, string> = {};

        if (!paymentInfo.cardNumber.trim()) {
            errors.cardNumber = 'Card number is required';
        } else if (paymentInfo.cardNumber.replace(/\s/g, '').length !== 16) {
            errors.cardNumber = 'Card number must be 16 digits';
        }

        if (!paymentInfo.nameOnCard.trim()) {
            errors.nameOnCard = 'Name on card is required';
        }

        if (!paymentInfo.expiryDate.trim()) {
            errors.expiryDate = 'Expiry date is required';
        } else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
            errors.expiryDate = 'Expiry date must be in MM/YY format';
        } else {
            // Check if card is not expired
            const [month, year] = paymentInfo.expiryDate.split('/');
            const expiryDate = new Date();
            expiryDate.setFullYear(2000 + parseInt(year), parseInt(month) - 1, 1);

            if (expiryDate < new Date()) {
                errors.expiryDate = 'Card has expired';
            }
        }

        if (!paymentInfo.cvv.trim()) {
            errors.cvv = 'Security code is required';
        } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
            errors.cvv = 'Security code must be 3 or 4 digits';
        }

        setPaymentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission for shipping
    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateShippingForm()) {
            setCurrentStep(2);
        }
    };

    // Handle form submission for payment
    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validatePaymentForm()) {
            setCurrentStep(3); // Move to review step
        }
    };

    // Handle final order submission
    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // Send order to API - only send the last 4 digits of card for receipt purposes
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cartId,
                    shippingInfo,
                    // Only send non-sensitive payment info for order records
                    paymentMethod: {
                        cardType: detectCardType(paymentInfo.cardNumber),
                        lastFour: paymentInfo.cardNumber.replace(/\s/g, '').slice(-4)
                    }
                }),
            });

            // Try to get the response as text first
            const responseText = await response.text();

            if (!response.ok) {
                // Try to parse the response as JSON
                try {
                    const errorData = JSON.parse(responseText);

                    // Handle stock issues
                    if (errorData.stockIssues) {
                        throw new Error('Some items in your cart are no longer available in the requested quantity. Please review your cart.');
                    }

                    throw new Error(errorData.error || 'Failed to process order');
                } catch (parseError) {
                    // If we can't parse the response as JSON, it's likely HTML error page
                    if (responseText.includes('<!DOCTYPE')) {
                        console.error('Server returned HTML instead of JSON. API endpoint might not exist.');
                        throw new Error('Server error occurred. Please try again later.');
                    } else {
                        throw new Error(responseText || 'Failed to process order');
                    }
                }
            }

            // Parse the successful response
            try {
                const data = JSON.parse(responseText);
                // Redirect to success page
                router.push(`/account`);
            } catch (parseError) {
                console.error('Failed to parse success response:', parseError);
                throw new Error('Received an invalid response from the server.');
            }

        } catch (error) {
            console.error('Checkout error:', error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
            setCurrentStep(1); // Go back to cart review
        } finally {
            setIsProcessing(false);
        }
    };

    // Go back to previous step
    const handleBack = () => {
        if (currentStep === 3) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setCurrentStep(1);
        } else {
            router.push('/cart');
        }
    };

    // Detect card type based on card number
    const detectCardType = (cardNumber: string): string => {
        const cleanNumber = cardNumber.replace(/\s/g, '');

        if (/^4/.test(cleanNumber)) return 'Visa';
        if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
        if (/^3[47]/.test(cleanNumber)) return 'American Express';
        if (/^6(?:011|5)/.test(cleanNumber)) return 'Discover';
        return 'Credit Card';
    };

    // Format currency for Australian dollars
    const formatCurrency = (amount: number): string => {
        return `$${amount.toFixed(2)} AUD`;
    };

    // Format card number for display
    const formatCardForDisplay = (cardNumber: string): string => {
        if (!cardNumber) return '';
        const lastFour = cardNumber.replace(/\s/g, '').slice(-4);
        return `•••• •••• •••• ${lastFour}`;
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            {/* Checkout Steps */}
            <div className="mb-8">
                <div className="flex items-center">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        1
                    </div>
                    <div className={`h-1 flex-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        2
                    </div>
                    <div className={`h-1 flex-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        3
                    </div>
                </div>
                <div className="flex justify-between mt-2 px-1 text-sm">
                    <span>Shipping</span>
                    <span>Payment</span>
                    <span>Review</span>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

                    <form onSubmit={handleShippingSubmit}>
                        <div className="mb-4">
                            <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={shippingInfo.fullName}
                                onChange={handleShippingChange}
                                className={`w-full px-3 py-2 border rounded-md ${shippingErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {shippingErrors.fullName && (
                                <p className="mt-1 text-sm text-red-600">{shippingErrors.fullName}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="addressLine1" className="block text-gray-700 font-medium mb-2">
                                Address Line 1
                            </label>
                            <input
                                type="text"
                                id="addressLine1"
                                name="addressLine1"
                                value={shippingInfo.addressLine1}
                                onChange={handleShippingChange}
                                className={`w-full px-3 py-2 border rounded-md ${shippingErrors.addressLine1 ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {shippingErrors.addressLine1 && (
                                <p className="mt-1 text-sm text-red-600">{shippingErrors.addressLine1}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="addressLine2" className="block text-gray-700 font-medium mb-2">
                                Address Line 2 (Optional)
                            </label>
                            <input
                                type="text"
                                id="addressLine2"
                                name="addressLine2"
                                value={shippingInfo.addressLine2}
                                onChange={handleShippingChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
                                    Suburb
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={shippingInfo.city}
                                    onChange={handleShippingChange}
                                    className={`w-full px-3 py-2 border rounded-md ${shippingErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {shippingErrors.city && (
                                    <p className="mt-1 text-sm text-red-600">{shippingErrors.city}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="state" className="block text-gray-700 font-medium mb-2">
                                    State
                                </label>
                                <select
                                    id="state"
                                    name="state"
                                    value={shippingInfo.state}
                                    onChange={handleShippingChange}
                                    className={`w-full px-3 py-2 border rounded-md ${shippingErrors.state ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Select State</option>
                                    <option value="NSW">New South Wales</option>
                                    <option value="VIC">Victoria</option>
                                    <option value="QLD">Queensland</option>
                                    <option value="WA">Western Australia</option>
                                    <option value="SA">South Australia</option>
                                    <option value="TAS">Tasmania</option>
                                    <option value="ACT">Australian Capital Territory</option>
                                    <option value="NT">Northern Territory</option>
                                </select>
                                {shippingErrors.state && (
                                    <p className="mt-1 text-sm text-red-600">{shippingErrors.state}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label htmlFor="postalCode" className="block text-gray-700 font-medium mb-2">
                                    Postcode
                                </label>
                                <input
                                    type="text"
                                    id="postalCode"
                                    name="postalCode"
                                    value={shippingInfo.postalCode}
                                    onChange={handleShippingChange}
                                    maxLength={4}
                                    className={`w-full px-3 py-2 border rounded-md ${shippingErrors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {shippingErrors.postalCode && (
                                    <p className="mt-1 text-sm text-red-600">{shippingErrors.postalCode}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="country" className="block text-gray-700 font-medium mb-2">
                                    Country
                                </label>
                                <select
                                    id="country"
                                    name="country"
                                    value={shippingInfo.country}
                                    onChange={handleShippingChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="Australia">Australia</option>
                                    <option value="New Zealand">New Zealand</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Canada">Canada</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={shippingInfo.phone}
                                    onChange={handleShippingChange}
                                    className={`w-full px-3 py-2 border rounded-md ${shippingErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., 0412 345 678"
                                />
                                {shippingErrors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{shippingErrors.phone}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={shippingInfo.email}
                                    onChange={handleShippingChange}
                                    className={`w-full px-3 py-2 border rounded-md ${shippingErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {shippingErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{shippingErrors.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-4 py-2 text-blue-600 hover:text-blue-800"
                            >
                                Return to Cart
                            </button>

                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Payment Information</h2>

                    <form onSubmit={handlePaymentSubmit}>
                        <div className="mb-4">
                            <label htmlFor="cardNumber" className="block text-gray-700 font-medium mb-2">
                                Card Number
                            </label>
                            <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={paymentInfo.cardNumber}
                                onChange={handlePaymentChange}
                                maxLength={19} // 16 digits + 3 spaces
                                placeholder="0000 0000 0000 0000"
                                className={`w-full px-3 py-2 border rounded-md ${paymentErrors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {paymentErrors.cardNumber && (
                                <p className="mt-1 text-sm text-red-600">{paymentErrors.cardNumber}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="nameOnCard" className="block text-gray-700 font-medium mb-2">
                                Name on Card
                            </label>
                            <input
                                type="text"
                                id="nameOnCard"
                                name="nameOnCard"
                                value={paymentInfo.nameOnCard}
                                onChange={handlePaymentChange}
                                className={`w-full px-3 py-2 border rounded-md ${paymentErrors.nameOnCard ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {paymentErrors.nameOnCard && (
                                <p className="mt-1 text-sm text-red-600">{paymentErrors.nameOnCard}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label htmlFor="expiryDate" className="block text-gray-700 font-medium mb-2">
                                    Expiry Date (MM/YY)
                                </label>
                                <input
                                    type="text"
                                    id="expiryDate"
                                    name="expiryDate"
                                    value={paymentInfo.expiryDate}
                                    onChange={handlePaymentChange}
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    className={`w-full px-3 py-2 border rounded-md ${paymentErrors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {paymentErrors.expiryDate && (
                                    <p className="mt-1 text-sm text-red-600">{paymentErrors.expiryDate}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="cvv" className="block text-gray-700 font-medium mb-2">
                                    Security Code (CVV)
                                </label>
                                <input
                                    type="password"
                                    id="cvv"
                                    name="cvv"
                                    value={paymentInfo.cvv}
                                    onChange={handlePaymentChange}
                                    maxLength={4}
                                    placeholder="•••"
                                    className={`w-full px-3 py-2 border rounded-md ${paymentErrors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {paymentErrors.cvv && (
                                    <p className="mt-1 text-sm text-red-600">{paymentErrors.cvv}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-4 py-2 text-blue-600 hover:text-blue-800"
                            >
                                Back to Shipping
                            </button>

                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                            >
                                Continue to Review
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Step 3: Order Review */}
            {currentStep === 3 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>

                    {/* Order Items */}
                    <div className="mb-6">
                        <h3 className="font-medium mb-3 pb-2 border-b">Order Items ({itemCount})</h3>
                        <div className="space-y-4 mt-2 max-h-60 overflow-y-auto">
                            {cartItems.length > 0 ? (
                                cartItems.map(item => (
                                    <div key={item.id} className="flex items-center py-2">
                                        <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-4">
                                            {item.product.imageUrl ? (
                                                <img
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="font-medium truncate">{item.product.name}</p>
                                            <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                                            <p className="text-gray-600 text-xs">{formatCurrency(item.product.price)} each</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-2 text-gray-600">Items summary not available</div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium mb-2">Shipping Information</h3>
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="text-blue-600 text-sm hover:underline"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="font-medium">{shippingInfo.fullName}</p>
                            <p>{shippingInfo.addressLine1}</p>
                            {shippingInfo.addressLine2 && <p>{shippingInfo.addressLine2}</p>}
                            <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</p>
                            <p>{shippingInfo.country}</p>
                            <p className="mt-2">
                                <span className="text-gray-600">Phone:</span> {shippingInfo.phone}
                            </p>
                            <p>
                                <span className="text-gray-600">Email:</span> {shippingInfo.email}
                            </p>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium mb-2">Payment Information</h3>
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="text-blue-600 text-sm hover:underline"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p>
                                <span className="text-gray-600">Card Type:</span> {detectCardType(paymentInfo.cardNumber)}
                            </p>
                            <p>
                                <span className="text-gray-600">Card Number:</span> {formatCardForDisplay(paymentInfo.cardNumber)}
                            </p>
                            <p>
                                <span className="text-gray-600">Name on Card:</span> {paymentInfo.nameOnCard}
                            </p>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mb-6">
                        <h3 className="font-medium mb-2">Order Summary</h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Items Subtotal:</span>
                                <span>{formatCurrency(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Shipping:</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                                <span>Order Total:</span>
                                <span>{formatCurrency(cartTotal)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-4 py-2 text-blue-600 hover:text-blue-800"
                        >
                            Back to Payment
                        </button>

                        <button
                            type="button"
                            onClick={handlePlaceOrder}
                            disabled={isProcessing}
                            className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {isProcessing ? 'Processing...' : `Place Order`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}