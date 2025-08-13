'use client'
import { useState } from "react";
import { Search, ShoppingCart, CreditCard, Wallet, Truck } from "lucide-react";

export default function AdminDashboard() {
  const [order, setOrder] = useState([
    { name: "Cheese Burger", price: 80, qty: 1 },
    { name: "Extra Fries", price: 15, qty: 1 },
  ]);

  const subtotal = order.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = 5;
  const delivery = 5;
  const total = subtotal - discount + delivery;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col p-4">
        <h1 className="text-xl font-bold text-orange-500 mb-6">Canteen Admin</h1>
        <nav className="space-y-3">
          {["Dashboard", "Orders", "Menu", "Categories", "Reports", "Settings"].map((item) => (
            <button key={item} className="w-full text-left p-2 rounded hover:bg-orange-100">
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center bg-white p-2 rounded-md shadow w-1/3">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search menu..."
              className="ml-2 w-full outline-none"
            />
          </div>
          <div className="flex items-center space-x-4">
            <img src="/user-avatar.png" className="w-10 h-10 rounded-full" alt="User" />
            <span className="font-semibold">Hello, Admin</span>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Categories</h2>
          <div className="flex gap-4">
            {["All", "Pizza", "Burgers", "Pasta", "Drinks"].map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div>
          <h2 className="text-lg font-bold mb-2">Menu</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "Cheese Burger", price: 80 },
              { name: "Veg Pizza", price: 100 },
              { name: "Pasta Alfredo", price: 90 },
              { name: "Cold Coffee", price: 50 },
            ].map((item) => (
              <div key={item.name} className="bg-white p-4 rounded-lg shadow hover:shadow-lg">
                <img src="/food-sample.jpg" alt={item.name} className="rounded-md mb-3" />
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-500">${item.price}</p>
                <button className="mt-2 bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600">
                  Add to Order
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Order Summary */}
      <aside className="w-80 bg-white p-6 shadow-md flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3">
            {order.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{item.name}</span>
                <span>${item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-${discount}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>${delivery}</span>
            </div>
            <div className="flex justify-between font-bold text-black">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="mt-6 mb-2 font-semibold">Payment Method</h3>
          <div className="flex gap-3">
            <button className="flex-1 bg-gray-100 p-2 rounded hover:bg-orange-100">Cash</button>
            <button className="flex-1 bg-gray-100 p-2 rounded hover:bg-orange-100">Card</button>
          </div>
          <button className="w-full mt-4 bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
            Confirm & Pay
          </button>
        </div>
      </aside>
    </div>
  );
}
