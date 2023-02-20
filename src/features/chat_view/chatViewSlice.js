import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: false,
}

const chatViewSlice = createSlice({
    name: "chatView",
    initialState,
    reducers: {
        chatViewEnd: (state, action) => {
            state.data = action.payload.data;
        }
    }
})

export const { chatViewEnd } = chatViewSlice.actions;

export const selectChatView = (state) => state.chatView.data;

export default chatViewSlice.reducer;