import { AttachFile, InsertEmoticon, Mic, MoreVert, SearchOutlined } from "@mui/icons-material";
import { Avatar, IconButton, Menu, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Chat.css";
import db from "./firebase";
import {
    getDoc, doc, getDocs, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, where
} from "./firebase";
import { useSelector, useDispatch } from "react-redux";
import { selectUserName, selectUserEmail } from "./features/user/userSlice";
import { getMessageStatus, selectUnreadMessage } from "./features/message_status/messageStatusSlice";
import { handleActive } from "./features/handle_active/handleActiveSlice";
import { selectChatView } from "./features/chat_view/chatViewSlice";

export default function Chat() {
    // const [seed, setSeed] = useState("");
    const [input, setInput] = useState("");
    const { roomId, seedPrivate } = useParams();
    // const [roomName, setRoomName] = useState("");
    // const [roomEmail, setRoomEmail] = useState("");
    // const [roomPhoto, setRoomPhoto] = useState("");
    // const [roomLastSeen, setRoomLastSeen] = useState("");
    const [roomUser, setRoomUser] = useState([]);
    const [messages, setMessages] = useState([]);
    const userName = useSelector(selectUserName);
    const userEmail = useSelector(selectUserEmail);
    const dispatch = useDispatch();
    const statusMessageUnread = useSelector(selectUnreadMessage);
    const chatViewPosition = useSelector(selectChatView);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // console.log("Messages: ", messages);
    // console.log("Room User: ", roomUser);
    // console.log("BELUM DIBACA: ", statusMessageUnread);

    chatEnd();

    useEffect(() => {
        if (roomId) {
            // STEP - 1
            // const docRef = doc(db, "rooms", roomId);
            // const docSnap = getDoc(docRef);
            // docSnap
            //     .then((docParams) => {
            //         if (docParams.exists()) {
            //             setRoomName(docParams.data().name);

            //             const msgColl = collection(db, "rooms", roomId, "messages");
            //             const queryMsgColl = getDocs(msgColl);
            //             queryMsgColl
            //                 .then((msgs) => {
            //                     setMessages(msgs.docs.map((msg) => msg.data()));
            //                 })
            //                 .catch((err) => {
            //                     console.log("Failed get subColl: ", err.message);
            //                 });
            //         } else {
            //             console.log("No such document!");
            //         }
            //     })
            //     .catch((err) => {
            //         console.log(`Your error: ${err.message}`);
            //     });

            // STEP - 2
            const unsubRoomUser = onSnapshot(doc(db, "rooms", roomId), (snapshot) => {
                // setRoomName(snapshot.data().name);
                // setRoomEmail(snapshot.data().email);
                // setRoomPhoto(snapshot.data().photo);
                // setRoomLastSeen(snapshot.data().last_seen);

                setRoomUser(snapshot.data());
            })

            // const q = doc(db, "rooms", roomId);
            // getDoc(q)
            //     .then((doc) => setRoomUser(doc.data()))
            //     .catch((err) => console.log(err.message));

            const queryMsgColl = query(collection(db, "rooms", roomId, `messages_${userEmail}`), orderBy("timestamp"));
            const unsubMessage = onSnapshot(queryMsgColl, (querySnapshot) => {
                setMessages(querySnapshot.docs.map((msg) => msg.data()));
            });

            const q = query(collection(db, "rooms", roomId, `messages_${userEmail}`), where("message_status", "==", "unread"));
            // getDocs(q)
            //     .then((snapshot) => {
            //         snapshot.docs.forEach((data) => {
            //             const updateMessageStatus = doc(db, "rooms", roomId, `messages_${userEmail}`, data.id);
            //             updateDoc(updateMessageStatus, {
            //                 message_status: "read",
            //             })
            //                 .then(() => console.log("Success update message status."))
            //                 .catch((err) => console.log(err.message));
            //         });
            //     })
            //     .catch((err) => console.log(err.message));

            const unsubMessageStatus = onSnapshot(q, (snapshot) => {
                snapshot.docs.forEach((data) => {
                    const updateMessageStatus = doc(db, "rooms", roomId, `messages_${userEmail}`, data.id);
                    updateDoc(updateMessageStatus, {
                        message_status: "read",
                    })
                        .then(() => console.log("Success update message status."))
                        .catch((err) => console.log(err.message));
                });
            });

            dispatch(handleActive({
                id: roomId,
                data: "active",
            }));

            return () => {
                unsubRoomUser();
                unsubMessage();
                unsubMessageStatus();
            }
        };
    }, [roomId]);

    const sendMessage = (e) => {
        e.preventDefault();
        // console.log(input);

        addDoc(collection(db, "rooms", roomId, `messages_${userEmail}`), {
            message: input,
            name: userName,
            timestamp: serverTimestamp(),
            message_status: "read",
        })
            .then(() => {
                const queryRoomsColl = query(collection(db, "rooms"), where("email", "==", userEmail));
                getDocs(queryRoomsColl)
                    .then((querySnapshot) => {
                        let userLoginId = "";
                        querySnapshot.docs.map((room) => userLoginId = room.id);

                        addDoc(collection(db, "rooms", userLoginId, `messages_${roomUser.email}`), {
                            message: input,
                            name: userName,
                            timestamp: serverTimestamp(),
                            message_status: "unread",
                        })
                            .then(() => {
                                updateDoc(doc(db, "rooms", roomId), {
                                    timestamp: serverTimestamp(),
                                })
                                    .then(() => {
                                        updateDoc(doc(db, "rooms", userLoginId), {
                                            last_seen: serverTimestamp(),
                                        })
                                            .then(() => console.log("Seccess update rooms timestamp."))
                                            .catch((err) => console.log(`Failed to update rooms timestamp! Error: ${err.message}`));
                                    })
                                    .catch((err) => console.log(`Failed to update rooms timestamp! Error: ${err.message}`));
                            })
                            .catch((err) => console.log(err.message));
                    })
                    .catch((err) => console.log(err.message));
            })
            .catch((err) => console.log(err.message));

        setInput("");
        chatEnd();
    };

    const deleteAllChat = () => {
        const queryMsgColl = collection(db, "rooms", roomId, `messages_${userEmail}`);
        getDocs(queryMsgColl)
            .then((msgs) => {
                msgs.docs.forEach((msg) => {
                    const deleteMsg = doc(db, "rooms", roomId, `messages_${userEmail}`, msg.id);
                    deleteDoc(deleteMsg)
                        .then(() => console.log("Success delete all message."))
                        .catch((err) => console.log(`Failed to delete all message. Error: ${err.message}`));
                });
            })
            .catch((err) => console.log(err.message));

        handleClose();
    }


    function chatEnd() {
        const chatEnd = document.getElementById("chatEnd");
        if (chatEnd) {
            chatEnd.scrollIntoView();
        }
    }

    return (
        <div className="chat">
            <div className="chat__header">
                {/* <Avatar src={`https://avatars.dicebear.com/api/human/${seedPrivate}.svg`} /> */}
                <Avatar src={roomUser.photo} />

                <div className="chat__headerInfo">
                    <h3>{roomUser.name ? roomUser.name : "Waiting..."}</h3>
                    <p>
                        Last seen{" "}
                        {/* {new Date(
                            messages[messages.length - 1]?.timestamp?.toDate()
                        ).toUTCString()} */}
                        {/* {new Date(roomLastSeen?.toDate()).toUTCString()} */}
                        {roomUser.last_seen ? new Date(
                            roomUser.last_seen?.toDate()
                        ).toUTCString() : "..."}
                    </p>
                </div>

                <div className="chat__headerRight">
                    <IconButton>
                        <SearchOutlined />
                    </IconButton>
                    <IconButton
                        aria-label="more"
                        id="long-button"
                        aria-controls={open ? 'long-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={handleClick}
                    >
                        <MoreVert />
                    </IconButton>
                    <Menu
                        id="long-menu"
                        MenuListProps={{
                            'aria-labelledby': 'long-button',
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={deleteAllChat}>Delete All Chat</MenuItem>
                    </Menu>
                </div>
            </div>

            <div className="chat__body">
                {messages.map((message, index) => (
                    <p key={index} className={`chat__message ${message.name === userName && "chat__reciever"}`}>
                        <span className="chat__name">{message.name}</span>
                        <span className="chat__text">{message.message}</span>
                        <span className="chat__timestamp">
                            {message.timestamp ? new Date(message.timestamp?.toDate()).toUTCString() : "Sending..."}
                        </span>
                    </p>
                ))}

                <span id="chatEnd"></span>
            </div>

            <div className="chat__footer">
                <IconButton>
                    <InsertEmoticon />
                </IconButton>
                <IconButton>
                    <AttachFile />
                </IconButton>
                <form>
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type message" />
                    <button type="submit" onClick={sendMessage}>Send a message</button>
                </form>
                <IconButton>
                    <Mic />
                </IconButton>
            </div>
        </div>
    )
}
