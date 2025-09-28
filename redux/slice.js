import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: 'cart',
  initialState:[],
  reducers: {
    removeCart: (state, action) => {
      // Remove by id
      return state.filter(item => item.id !== action.payload.id);
    },
    removeItem: (state, action) => {
      // Remove by id (alias for removeCart)
      return state.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.find(i => i.id === id);
      if (item) {
        item.quantity = Number(quantity) || 1;
      }
    },
    addCart: (state, action) => {
      // Optional: add item or increase qty if exists
      const existing = state.find(i => i.id === action.payload.id);
      if (existing) {
        existing.quantity += Number(action.payload.quantity) || 1;
      } else {
        state.push({
          ...action.payload,
          price: Number(action.payload.price) || 0,
          extrasPrice: Number(action.payload.extrasPrice) || 0,
          quantity: Number(action.payload.quantity) || 1,
        });
      }
    },
    addItem: (state, action) => {
      // Add item to cart (alias for addCart)
      const existing = state.find(i => i.id === action.payload.id);
      if (existing) {
        existing.quantity += Number(action.payload.quantity) || 1;
      } else {
        state.push({
          ...action.payload,
          price: Number(action.payload.price) || 0,
          quantity: Number(action.payload.quantity) || 1,
        });
      }
    },
    cartClear:(state,action)=>{
       return [] // ✅ clears the array correctly
    }
  },
});

export const { removeCart, removeItem, updateQuantity, addCart, addItem, cartClear } = cartSlice.actions;
export default cartSlice.reducer;