import { Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import "./SidebarChat.css";
import db from "./firebase";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, onSnapshot, serverTimestamp } from "./firebase";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUserEmail } from "./features/user/userSlice";
import { selectId, selectData } from "./features/handle_active/handleActiveSlice";
import { chatViewEnd } from "./features/chat_view/chatViewSlice";

export default function SidebarChat({ addNewChat, id, name, photo }) {
    const [seed, setSeed] = useState("");
    const [messages, setMessages] = useState("");
    const userEmail = useSelector(selectUserEmail);
    const [unreadMessage, setUnreadMessage] = useState("");
    const [selectAccount, setSelectAccount] = useState("");
    const handleActiveId = useSelector(selectId);
    const handleActiveData = useSelector(selectData);
    const dispatch = useDispatch();

    // console.log("TOTAL: ", unreadMessage);
    // console.log("TYPE DATA: ", typeof (unreadMessage));

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000));
    }, []);

    useEffect(() => {
        if (id) {
            const queryMsgColl = query(collection(db, "rooms", id, `messages_${userEmail}`), orderBy("timestamp", "desc"));
            const unsubMessage = onSnapshot(queryMsgColl, (querySnapshot) => {
                setMessages(querySnapshot.docs.map((msg) => msg.data()));
            });

            const q = query(collection(db, "rooms", id, `messages_${userEmail}`), where("message_status", "==", "unread"));
            const unsubUnreadMessage = onSnapshot(q, (snapshot) => {
                let unreadData = [];
                snapshot.docs.map((doc) => unreadData.push(doc.id));
                setUnreadMessage(unreadData.length);
            });

            return () => {
                unsubMessage();
                unsubUnreadMessage();
            }
        }
    }, [id, userEmail]);

    const createChat = () => {
        const roomName = prompt("Enter your name");

        if (roomName) {
            addDoc(collection(db, "rooms"), {
                name: roomName,
                timestamp: serverTimestamp(),
            })
                .then(() => console.log("Success add a new data."))
                .catch((err) => console.log(`Your error: ${err.message}`));
        }
    }

    // const deleteRoom = (id) => {
    //     const docRef = doc(db, "rooms", id);
    //     deleteDoc(docRef)
    //         .then(() => console.log("Deleted."))
    //         .catch((err) => console.log(`Your error: ${err.message}`));
    // }

    // const readMessage = (id) => {
    // const q = query(collection(db, "rooms", id, `messages_${userEmail}`), where("message_status", "==", "unread"));

    // onSnapshot(q, (snapshot) => {
    //     snapshot.docs.forEach((data) => {
    //         const updateMessageStatus = doc(db, "rooms", id, `messages_${userEmail}`, data.id);
    //         updateDoc(updateMessageStatus, {
    //             message_status: "read",
    //         })
    //             .then(() => console.log("Success update message status."))
    //             .catch((err) => err.message);
    //     });
    // });

    // getDocs(q)
    //     .then((snapshot) => {
    //         snapshot.docs.forEach((data) => {
    //             const updateMessageStatus = doc(db, "rooms", id, `messages_${userEmail}`, data.id);
    //             updateDoc(updateMessageStatus, {
    //                 message_status: "read",
    //             })
    //                 .then(() => console.log("Success update message status."))
    //                 .catch((err) => console.log(err.message));
    //         });
    //     })
    //     .catch((err) => console.log(err.message));
    // }

    const setChatView = () => {
        dispatch(chatViewEnd({
            data: true,
        }));
    };

    const truncate = (str, n) => {
        return str?.length > n ? str.substr(0, n) + "..." : str;
    }

    return !addNewChat ? (
        <Link to={`/rooms/${id}/${seed}`}>
            <div className={`sidebarChat ${handleActiveId === id ? handleActiveData : ""}`} onClick={setChatView}>
                {/* <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} /> */}
                <Avatar src={photo} />
                <div className="sidebarChat__info">
                    <div className="nameUnread__info">
                        <div className="name__info">
                            <h2>{name}</h2>
                        </div>
                        <div className="unread__info">
                            {unreadMessage > 0 && (
                                <div className="budge">
                                    <h2>{unreadMessage}</h2>
                                </div>
                            )}
                        </div>
                    </div>
                    <p>{truncate(messages[0]?.message, 20)}</p>
                </div>
            </div>
        </Link>
    ) : (
        <div className="sidebarChat" onClick={createChat}>
            <h2>+ Add new status</h2>
        </div>
    );
}
