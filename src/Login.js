import { Button } from "@mui/material";
import "./Login.css";
import db from "./firebase";
import { auth, provider, signInWithPopup, signOut, doc, onSnapshot, getDoc, getDocs, query, where, collection, addDoc, serverTimestamp } from "./firebase";
import { Google } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { selectUserName, selectUserEmail, setUserLoginDetails, setSignOutState } from "./features/user/userSlice";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const dispatch = useDispatch();
    const userName = useSelector(selectUserName);
    const userEmail = useSelector(selectUserEmail);
    const navigate = useNavigate();

    // console.log(userName);

    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                navigate("/");
            } else {
                console.log("You're logout!");
            }
        });

        return () => {
            unsubAuth();
        }
    }, [userName]);

    const signIn = () => {
        // if (!userName) {
        //     signInWithPopup(auth, provider)
        //         .then((res) => {
        //             const user = res.user;
        //             setUser(user);
        //             console.log("Welcome back!");
        //             console.log(user);
        //         })
        //         .catch((err) => {
        //             console.log(`Your error: ${err.message}`);
        //         });
        // } else {
        //     console.log(`Username: ${userName}`);
        // }

        signInWithPopup(auth, provider)
            .then((res) => {
                console.log("Welcome back!", res.user.email);

                const queryRoomsColl = collection(db, "rooms");
                getDocs(queryRoomsColl)
                    .then((snapshot) => {
                        let arrEmail = [];
                        snapshot.docs.forEach((doc) => {
                            arrEmail.push(doc.data());
                        });

                        let arrFilter = arrEmail.filter((data) => data.email === res.user.email).length;

                        if (arrFilter === 0) {
                            signOut(auth)
                                .then(() => {
                                    dispatch(setSignOutState());
                                    navigate("/");
                                    console.log("Your account is not found. Please, sign up now!");
                                })
                                .catch((err) => console.log(err.message));
                        } else {
                            setUser(res.user);
                        }
                    })
                    .catch(() => console.log("Failed to get rooms!"));
            })
            .catch((err) => {
                console.log(`Your error: ${err.message}`);
            });
    };

    const signUp = () => {
        signInWithPopup(auth, provider)
            .then((res) => {
                console.log("Welcome back!", res.user.email);

                const queryRoomsColl = collection(db, "rooms");
                getDocs(queryRoomsColl)
                    .then((snapshot) => {
                        let arrEmail = [];
                        snapshot.docs.forEach((doc) => {
                            arrEmail.push(doc.data());
                        });

                        let arrFilter = arrEmail.filter((data) => data.email === res.user.email).length;

                        if (arrFilter === 0) {
                            addDoc(collection(db, "rooms"), {
                                name: res.user.displayName,
                                email: res.user.email,
                                photo: res.user.photoURL,
                                timestamp: serverTimestamp(),
                                last_seen: serverTimestamp(),
                            })
                                .then(() => {
                                    console.log("Success create a new account.");
                                    setUser(res.user);
                                })
                                .catch((err) => {
                                    console.log(`Failed create a new account! Error: ${err.message}`);
                                });
                        } else {
                            setUser(res.user);
                        }
                    })
                    .catch(() => {
                        console.log("Failed to get rooms!");
                    });
            })
            .catch((err) => {
                console.log(`Your error: ${err.message}`);
            });
    };

    const setUser = (user) => {
        dispatch(setUserLoginDetails({
            name: user.displayName,
            email: user.email,
            photo: user.photoURL
        }))
    };

    return (
        <div className="login">
            <div className="login__container">
                <img src="./images/whatsapp-logo-2.svg" alt="WhatsApp-Logo" />
                <div className="login__text">
                    <h1>WhatsApp Clone</h1>
                </div>
                <div className="login__buttons">
                    <Button className="btn__signIn" onClick={signIn}><Google />&nbsp;Sign In With Google</Button>
                    <Button className="btn__signUp" onClick={signUp}><Google />&nbsp;Sign Up With Google</Button>
                </div>
            </div>
        </div>
    )
}
