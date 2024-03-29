'use client'

import { useEffect } from "react";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation'

import { User } from "../layout";

export default function Page() {
    const router = useRouter();
    const user = User();

    useEffect(() => {
        Cookies.remove("token");
        user.setLoggedin(false);
        router.push("/login");
    })

    return (
        <div>Logging you out...</div>
    )
}