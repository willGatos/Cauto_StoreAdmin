import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SLICE_BASE_NAME } from "./constants";
import { User } from "@/@types/auth";

export const initialState: User = {
  id: null,
  name: "",
  email: "",
  phone: "",
  roles: [],
  shopId: "",
};

const userSlice = createSlice({
  name: `${SLICE_BASE_NAME}/user`,
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.id = action.payload?.id;
      state.email = action.payload?.email;
      state.name = action.payload?.name;
      state.name = action.payload?.name;
      state.phone = action.payload?.phone;
      state.roles = action.payload?.roles;
      state.shopId = action.payload?.shopId;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
