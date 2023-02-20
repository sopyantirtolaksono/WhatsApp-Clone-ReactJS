import "./Sidebar.css";
import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { Chat, DonutLarge, MoreVert, SearchOutlined } from "@mui/icons-material";
import SidebarChat from "./SidebarChat";
import { useEffect, useState } from "react";
import db from "./firebase";
import { auth, getDocs, getDoc, doc, collection, query, onSnapshot, orderBy, signOut, where, addDoc, deleteDoc, serverTimestamp } from "./firebase";
import { useSelector, useDispatch } from "react-redux";
import { selectUserPhoto, selectUserEmail, selectUserName, setSignOutState, setUserLoginDetails } from "./features/user/userSlice";
import { handleNonActive } from "./features/handle_active/handleActiveSlice";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
    const [rooms, setRooms] = useState([]);
    const userPhoto = useSelector(selectUserPhoto);
    const userEmail = useSelector(selectUserEmail);
    const userName = useSelector(selectUserName);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // console.log("Ini link foto: ", userPhoto);
    // console.log("Ini email: ", userEmail);
    // console.log("Ini username: ", userName);

    useEffect(() => {
        // STEP - 1
        // const querySnapshot = getDocs(collection(db, "rooms"));
        // querySnapshot
        //     .then((snapshot) => {
        //         setRooms(snapshot.docs.map((doc) => ({
        //             id: doc.id,
        //             data: doc.data(),
        //         })));

        //         console.log(rooms);
        //     })
        //     .catch(err => {
        //         console.log(`Your error: ${err.message}`);
        //     });

        // STEP - 2
        // const queryRoomsColl = query(collection(db, "rooms"), where("email", "!=", userEmail));
        const queryRoomsColl = query(collection(db, "rooms"), orderBy("timestamp", "desc"));
        const unsubRooms = onSnapshot(queryRoomsColl, (roomsColl) => {
            setRooms(roomsColl.docs.map((rooms) => ({
                id: rooms.id,
                data: rooms.data(),
            })));
        });

        return () => {
            unsubRooms();
        }
    }, []);

    const logout = () => {
        signOut(auth)
            .then(() => {
                dispatch(handleNonActive());
                dispatch(setSignOutState());
                navigate("/");
                console.log("You're logout!");
            })
            .catch((err) => console.log(err.message));
    }

    const deleteAccount = () => {
        const confirm = window.confirm("Delete your account?");
        if (confirm) {
            const q = query(collection(db, "rooms"), where("email", "==", userEmail));
            getDocs(q)
                .then((delDocs) => {
                    delDocs.docs.forEach((delDoc) => {
                        deleteDoc(doc(db, "rooms", delDoc.id))
                            .then(() => {
                                signOut(auth)
                                    .then(() => {
                                        window.alert("Your account is deleted.");
                                        dispatch(setSignOutState());
                                        navigate("/");
                                    })
                                    .catch((err) => window.alert(err.message));
                            })
                            .catch((err) => window.alert(err.message));
                    })
                })
                .catch((err) => window.alert(err.message));

        } else {
            handleClose();
        }
    }

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <Avatar src={userPhoto} />
                <div className="sidebar__headerRight">
                    <IconButton>
                        <DonutLarge />
                    </IconButton>
                    <IconButton>
                        <Chat />
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
                        <MenuItem onClick={logout}>Logout</MenuItem>
                        <MenuItem onClick={deleteAccount}>Delete My Account</MenuItem>
                    </Menu>
                </div>
            </div>

            <div className="sidebar__search">
                <div className="sidebar__searchContainer">
                    <SearchOutlined />
                    <input type="text" placeholder="Search or start new chat" />
                </div>
            </div>

            <div className="sidebar__chats">
                <SidebarChat addNewChat />
                {rooms && rooms.map((room) => (
                    <>
                        {room.data.email !== userEmail && (
                            <SidebarChat key={room.id} id={room.id} name={room.data.name} photo={room.data.photo} />
                        )}
                    </>
                ))}
            </div>
        </div>
    )
}
