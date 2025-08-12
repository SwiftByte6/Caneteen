'use client'
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiMinus, FiPlus, FiX, FiArrowLeft } from 'react-icons/fi';
import { removeCart, updateQuantity } from '@/redux/slice';

export default function CartPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart) || [];
  const [shippingMode, setShippingMode] = React.useState('pickup');

  // Increase or decrease quantity, minimum 1
  const handleQuantityChange = (id, delta) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, (item.quantity || 1) + delta);
    dispatch(updateQuantity({ id, quantity: newQty }));
  };

  // Remove item from cart
  const handleRemoveItem = (item) => {
    dispatch(removeCart(item));
  };

  // Calculate subtotal safely
  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const extrasPrice = Number(item.extrasPrice) || 0;
    const quantity = Number(item.quantity) || 1;
    return acc + (price + extrasPrice) * quantity;
  }, 0);

  const shippingCost = shippingMode === 'delivery' ? 9.9 : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">My Cart</h1>
          <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition">
            <FiArrowLeft size={20} />
            Continue shopping
          </button>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[4fr_1fr_1fr_1fr] text-gray-500 uppercase text-xs font-semibold border-b border-gray-200 pb-3 mb-4">
          <div>PRODUCT</div>
          <div>PRICE</div>
          <div>QTY</div>
          <div>TOTAL</div>
        </div>

        {/* Cart Items */}
        <div className="flex flex-col divide-y divide-gray-200">
          {cartItems.length === 0 && (
            <div className="text-center py-10 text-gray-500">Your cart is empty.</div>
          )}

          {cartItems.map((item) => {
            // Safe values with defaults
            const price = Number(item.price) || 0;
            const extrasPrice = Number(item.extrasPrice) || 0;
            const quantity = Number(item.quantity) || 1;
            const priceWithExtras = price + extrasPrice;
            const totalPrice = priceWithExtras * quantity;

            return (
              <div
                key={item.id}
                className="flex flex-col md:grid md:grid-cols-[4fr_1fr_1fr_1fr] items-center py-6"
              >
                {/* Product info */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name || 'Product'}
                      className="w-20 h-16 object-contain rounded-md"
                    />
                  ) : (
                    <div className="w-20 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  <div>
                    <h2 className="font-semibold text-gray-900">{item.name || 'Unnamed Product'}</h2>
                    {item.sku && <p className="text-xs text-gray-500">{item.sku}</p>}

                    {Array.isArray(item.extras) && item.extras.length > 0 ? (
                      <p className="text-xs text-gray-500">
                        Color: {item.color || 'N/A'} &nbsp; // &nbsp;
                        <span className="font-semibold">Extra:</span> {item.extras.join(' + ')}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">Color: {item.color || 'N/A'}</p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mt-4 md:mt-0 text-gray-700 text-sm text-center">
                  {priceWithExtras.toFixed(2)}€
                </div>

                {/* Quantity controls */}
                <div className="mt-4 md:mt-0 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="border border-gray-300 rounded px-2 py-1 hover:bg-gray-200 transition"
                    aria-label="Decrease quantity"
                  >
                    <FiMinus />
                  </button>
                  <span className="font-semibold">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="border border-gray-300 rounded px-2 py-1 hover:bg-gray-200 transition"
                    aria-label="Increase quantity"
                  >
                    <FiPlus />
                  </button>
                </div>

                {/* Total price and remove */}
                <div className="mt-4 md:mt-0 flex items-center justify-between w-full md:w-auto">
                  <span className="font-semibold">{totalPrice.toFixed(2)}€</span>
                  <button
                    onClick={() => handleRemoveItem(item)}
                    aria-label="Remove item"
                    className="text-gray-400 hover:text-red-600 transition ml-4"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Shipping mode */}
        <div className="mt-10 p-6 bg-gray-100 rounded-xl flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-0">
          <div className="md:w-1/2">
            <h3 className="font-semibold text-gray-900 mb-4">Choose shipping mode:</h3>

            <label className="flex items-center gap-3 mb-3 cursor-pointer">
              <input
                type="radio"
                name="shipping"
                checked={shippingMode === 'pickup'}
                onChange={() => setShippingMode('pickup')}
                className="w-5 h-5 cursor-pointer"
              />
              <span className="font-semibold text-gray-800">Store pickup</span>
              <span className="text-gray-600">(In 20 min)</span>
              <span className="ml-2 font-bold text-green-600">FREE</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="shipping"
                checked={shippingMode === 'delivery'}
                onChange={() => setShippingMode('delivery')}
                className="w-5 h-5 cursor-pointer mt-1"
              />
              <div>
                <span className="font-semibold text-gray-800">Delivery at home</span>
                <span className="text-gray-600 ml-1">(Under 2 - 4 day)</span>
                <div className="text-xs text-gray-500 mt-1">
                  At 45 Glenridge Ave. Brooklyn, NY 11220
                </div>
              </div>
              <span className="ml-auto font-bold text-gray-800">9.90€</span>
            </label>
          </div>

          {/* Order summary */}
          <div className="md:w-1/2 bg-white p-6 rounded-xl shadow-lg text-gray-900">
            <div className="flex justify-between mb-3">
              <span className="font-semibold text-sm uppercase">Subtotal TTC</span>
              <span className="font-semibold">{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="font-semibold text-sm uppercase">Shipping</span>
              <span className="font-semibold">
                {shippingMode === 'pickup' ? 'Free' : '9.90€'}
              </span>
            </div>
            <div className="border-t border-gray-300 mt-4 pt-4 flex justify-between font-extrabold text-xl">
              <span>Total</span>
              <span>{total.toFixed(2)}€</span>
            </div>
            <button className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition">
              Checkout {total.toFixed(2)} €
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
