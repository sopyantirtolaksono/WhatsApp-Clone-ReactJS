import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: "",
    data: "",
}

const handleActiveSlice = createSlice({
    name: "handleActive",
    initialState,
    reducers: {
        handleActive: (state, action) => {
            state.id = action.payload.id;
            state.data = action.payload.data
        },
        handleNonActive: (state) => {
            state.id = "";
            state.data = "";
        },
    }
});

export const { handleActive, handleNonActive } = handleActiveSlice.actions;

export const selectId = (state) => state.handleActive.id;
export const selectData = (state) => state.handleActive.data;

export default handleActiveSlice.reducer;