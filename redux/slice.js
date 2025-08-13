import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: 'cart',
  initialState:[],
  reducers: {
    removeCart: (state, action) => {
      // Remove by id
      return state.filter(item => item.id !== action.payload.id);
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
    cartClear:(state,action)=>{
       return [] // ✅ clears the array correctly
    }
  },
});

export const { removeCart, updateQuantity, addCart,cartClear } = cartSlice.actions;
export default cartSlice.reducer;