import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    unread: "",
};

const messageStatusSlice = createSlice({
    name: "messageStatus",
    initialState,
    reducers: {
        getMessageStatus: (state, action) => {
            state.unread = action.payload.unread;
        },
    },
});

export const { getMessageStatus } = messageStatusSlice.actions;

export const selectUnreadMessage = (state) => state.messageStatus.unread;

export default messageStatusSlice.reducer;