import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { MOCK_PRODUCTS, type CartItem } from "../data";

const cartSlice = createSlice({
  name: "shoppingCart",
  initialState: [] as CartItem[],
  reducers: {
    addItem(state, action: PayloadAction<string>) {
      const index = state.findIndex((prod) => prod.item.id === action.payload);
      if (index !== -1) {
        state[index].quantity += 1;
      } else {
        const product = MOCK_PRODUCTS.find((p) => p.id === action.payload);
        if (product) state.push({ item: product, quantity: 1 });
      }
    },
    updateQuantity(state, action: PayloadAction<{ id: string; amount: number }>) {
      const index = state.findIndex((prod) => prod.item.id === action.payload.id);
      if (index !== -1) {
        state[index].quantity += action.payload.amount;
        if (state[index].quantity <= 0) state.splice(index, 1);
      }
    },
  },
});

export const { addItem, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
