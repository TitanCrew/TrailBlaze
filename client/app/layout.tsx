'use client'

import React, { createContext, useEffect, useState, useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "../components/Navigation";
import '../public/static/css/globals.css'

import Loading from '../components/Loading';

import Link from 'next/link';
import Cookies from 'js-cookie';

const Context = createContext(null);

export default function RootLayout({ children, }: { children: React.ReactNode }) {
    const [isMobile, setisMoblie] = useState(null);
    const [loggedin, setLoggedin] = useState(false);
    const [respHook, setRespHook] = useState(false);
    const [userData, setUserData] = useState({ username: "", phone: "" });
    const [cache, setCache] = useState(false);

    useEffect(() => {
        setisMoblie(window.innerWidth <= 640);
    }, [])

    useEffect(() => {
        const verify = async () => {
            const data = await fetch("/api/user/verify", {
                headers: {
                    "Authorization": `Bearer ${Cookies.get('token')}`
                }
            });
            const jsonData = await data.json();
            if (jsonData.status == "success") {
                setUserData(jsonData.data);
                setLoggedin(true);
            }
            setRespHook(true);
        }
        verify();
    }, [])

    useEffect(() => {
        async function preloadImages(array) {
            for (var i = 0; i < array.length; i++) {
                await new Promise((resolve, reject) => {
                    var img = new Image();
                    img.src = array[i];
                    img.onload = () => { resolve("loaded") };
                })
            }
            setCache(true);
        }
        preloadImages(["/static/assets/rocket.gif", "/static/assets/astronot.gif", "/static/assets/two_astronauts.gif", "/static/assets/fastAstro.gif"]);
    }, [])

    return (
        <html lang='en'>
            <head>
                <title>TrailBlaze</title>
                <link rel='icon' type='image/x-icon' href='/static/assets/favicon.ico'></link>
            </head>
            <body className='flex flex-col w-screen min-h-screen overflow-x-hidden bg-slate-900'>
                <div className='fixed bg-slate-800 shadow-lg h-14 w-full flex justify-center items-center transition-all z-50'>
                    { isMobile != null ? ( isMobile ?
                        <></>:
                        <>
                            <div className='absolute text-center font-Bungee text-4xl py-2 text-slate-500 w-min left-4'><Link href="/">{process.env.NEXT_PUBLIC_EVENT_NAME}</Link></div>
                            <div className='absolute flex right-2 gap-3'>
                                <Navbar loggedin={loggedin}></Navbar>
                            </div>
                        </> ) : <Loading text=""></Loading> }
                </div>
                {isMobile != null ? ( isMobile ? <div className='absolute flex flex-col justify-center items-center top-0 end-0 bg-slate-800 h-screen w-screen'>
                    <p className='mt-20 text-slate-400'>THIS IS A DESKTOP APPLICATION</p>
                    <div className='bg-deskOnly h-full w-full bg-contain bg-no-repeat bg-center'></div>
                </div> : cache ? <Context.Provider value={{ loggedin, setLoggedin, userData, respHook, setUserData }}> { children } </Context.Provider> : <Loading text={ JSON.stringify(["loading assets", "initializing worlds", "hacking planet", "compromising galaxy", "helping earth"]) }></Loading>) : <></>}
                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable
                    pauseOnHover
                    theme="light"
                />
                <div className='z-40 fixed bottom-5 end-5 text-slate-500'>made by titans@titancrew 👀</div>
            </body>
        </html>
    )
}

export function User() {
    return useContext(Context);
}