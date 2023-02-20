import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import messageStatusReducer from "../features/message_status/messageStatusSlice";
import handleActiveReducer from "../features/handle_active/handleActiveSlice";
import chatViewReducer from "../features/chat_view/chatViewSlice";

const store = configureStore({
    reducer: {
        user: userReducer,
        messageStatus: messageStatusReducer,
        handleActive: handleActiveReducer,
        chatView: chatViewReducer,
    }
});

export default store;