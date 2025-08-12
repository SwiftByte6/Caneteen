'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { getAllItem } from '@/lib/supabaseHelper';
import { CiSearch, CiFilter } from "react-icons/ci";
import { LiaSortAmountUpAltSolid } from "react-icons/lia";
import { supabase } from '@/lib/supabaseClient';
import { addCart } from '@/redux/slice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';


const Page = () => {
  const [data, setData] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [filteredProduct, setFilteredProduct] = useState([]);
  const [category, setCategory] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const dispatch =useDispatch()

  const sendData=(data)=>{
    dispatch(addCart(data))
    console.log(cartData)
  }

  const cartData=useSelector((state)=>state.cart)
  // Fetch all items
  useEffect(() => {
    (async () => {
      const items = await getAllItem();
      setData(items || []);
    })();
  }, []);

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() === '') {
        setFilteredProduct([]);
      } else {
        getSearchProduct(searchInput);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Search from Supabase
  const getSearchProduct = useCallback(async (term) => {
    const { data, error } = await supabase
      .from("Items")
      .select("*")
      .ilike("name", `%${term}%`);

    if (!error) setFilteredProduct(data || []);
    else console.error("Search error:", error.message);
  }, []);

  // Filtering & sorting
  const getDisplayedData = () => {
    let items = filteredProduct.length > 0 ? filteredProduct : data;

    if (category) items = items.filter(item => item.category === category);
    if (availableOnly) items = items.filter(item => item.available);

    if (sortOption) {
      items = [...items].sort((a, b) => {
        switch (sortOption) {
          case 'name_asc': return a.name.localeCompare(b.name);
          case 'name_desc': return b.name.localeCompare(a.name);
          case 'price_asc': return a.price - b.price;
          case 'price_desc': return b.price - a.price;
          default: return 0;
        }
      });
    }

    // If no search results found
    if (filteredProduct.length === 0 && searchInput.trim() !== '' && items.length === 0) {
      return [];
    }
    return items;
  };

  const displayedData = getDisplayedData();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Canteen Menu</h1>
      <p className="text-gray-600 mb-6">Discover delicious meals and treats</p>

      {/* Filters & Search */}
      <div className="flex flex-wrap justify-between gap-6 shadow-2xl p-4 rounded-3xl bg-white">
        {/* Search & Category */}
        <div className="flex flex-col space-y-4 w-full sm:w-auto">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Menu Items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          </div>

          <div className="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
            <CiFilter className="text-gray-600 text-xl" />
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700 cursor-pointer"
            >
              <option value="">All</option>
              <option value="snack">Snack</option>
              <option value="fastfood">Fast Food</option>
              <option value="breakfast">Breakfast</option>
              <option value="maincourse">Main Course</option>
            </select>
          </div>
        </div>

        {/* Sort & Availability */}
        <div className="flex flex-col space-y-4 w-full sm:w-auto text-right">
          <div className="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 ml-auto">
            <LiaSortAmountUpAltSolid className="text-gray-600 text-xl" />
            <select
              name="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700 cursor-pointer"
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium ml-auto">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={() => setAvailableOnly(!availableOnly)}
              className="accent-green-500"
            />
            Available only
          </label>
        </div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {displayedData.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 text-lg">
            No item found
          </div>
        ) : (
          displayedData.map((item, i) => (
            <div key={i} className="h-[370px] w-[270px] bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition">
              {/* Image */}
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col justify-between h-[calc(350px-160px)]">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <p className="text-sm text-gray-400 mt-1">Category: {item.category}</p>
                  <p className="mt-2 font-bold text-green-600">₹{item.price}</p>
                </div>

                {/* Availability */}
                <div className="mt-3">
                  {item.available ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">Available</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">Out of Stock</span>
                  )}
                 
                </div>
                 <button
                 onClick={()=>sendData(item)}
                 className='bg-black text-white px- py-2 mb-2 rounded-2xl font-bold '>Add to Cart</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Page;
