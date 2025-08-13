'use client';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckoutPage() {
  const cartItems = useSelector((state) => state.cart) || [];
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const router = useRouter();
    const orderData = {
    total_amount: subtotal,
    transaction_id: 'TXN123',
  };



  const handlePlaceOrder = () => {
    // Later: integrate Razorpay
    // For now: store order in DB or localStorage
    console.log("Order placed", { cartItems, name, address, subtotal });
    router.push('/order-confirmation', { state: orderData });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="mb-6">
        <label className="block mb-1 font-semibold">Full Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
               className="border p-2 w-full rounded" placeholder="Enter your name" />
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-semibold">Address</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)}
                  className="border p-2 w-full rounded" placeholder="Enter your address"></textarea>
      </div>

      <div className="border-t pt-4">
        <h2 className="font-bold mb-2">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between text-sm mb-1">
            <span>{item.name} x {item.quantity}</span>
            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold mt-2">
          <span>Total</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="mt-6 w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
      >
        Place Order
      </button>
    </div>
  );
}
