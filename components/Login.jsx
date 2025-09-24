'use client'

import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const[loading,setLoading]=useState(false)
    const [isSignUp, setIsSignUp] = useState(false); // toggle between login & signup

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        

        if(!email){
            setError("Please enter the email  id")
            return ;
        }
        if(!password){
            setError("Please Enter the password")
        }
        setLoading(true);
        try {
            if (isSignUp) {
                // Sign Up
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                console.log("Sign up success:", data);
            } else {
                // Login
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                console.log("Login success:", data);
                setLoading(false)
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-white bg-cover bg-center bg-no-repeat ">

            {/* Decorative Background for Mobile */}
            <div className="absolute opacity-75  inset-0 md:hidden">
                <Image
                    src="/Login/checksBack.png"
                    alt="Background pattern"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Decorative Chef Image for Mobile */}
            <div className="absolute pointer-events-none md:hidden bottom-0 left-[calc(-30%)] sm:left-[calc(-15%)] z-1000">
                <Image
                    src="/Login/cheif.png"
                    height={700}
                    width={300}
                    alt="Decorative chef image"
                    className="object-contain w-[100vw] h-[40vh]"
                />
            </div>

            <div className="flex w-[95vw] max-w-6xl h-[56vh] md:h-[80vh] bg-white rounded-xl shadow-lg relative overflow-hidden z-10">
                <div
                    className="absolute pointer-events-none hidden md:block bottom-0 left-[calc(-30%)] sm:left-[calc(-15%)] z-1000">
                    <Image
                        src="/Login/cheif.png"
                        height={700}
                        width={700}
                        alt="Decorative chef image"
                        className="object-contain w-[100vw] h-[70vh]"
                    />
                </div>

                {/* Left Side Image for Desktop */}
                <div className="hidden md:flex w-1/2 bg-[url('/Login/checksBack.png')] bg-cover bg-center"></div>

                {/* Login / Signup Form */}
                <form
                    onSubmit={handleSubmit}
                    className="w-full md:w-1/2 flex flex-col justify-between p-6"
                >
                    {/* Heading */}
                    <h1 className="font-extrabold text-5xl text-center text-transparent bg-clip-text bg-gradient-to-b from-orange-600/95 via-orange-300 to-orange-500/80 mb-6 p-3">
                        {isSignUp ? "Sign Up" : "Login"}
                    </h1>

                    {/* Input Fields */}
                    <div className="flex flex-col gap-6">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full p-3 text-xl font-bold border-b-2 border-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-3 text-xl font-bold border-b-2 border-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
                    )}

                    {/* Remember Me + Forgot Password */}
                    {!isSignUp && (
                        <div className="flex justify-end items-center mt-4 text-sm">
                            {/* <label className="flex items-center gap-2">
                                <input type="checkbox" className="w-4 h-4 accent-orange-500" />
                                Remember me
                            </label> */}
                            <a href="#" className="text-orange-500 hover:underline">Forgot Password?</a>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-[150px] mx-auto mt-6 py-3 bg-[#FE8D3C] text-white font-bold rounded-2xl hover:bg-orange-600 transition shadow-[0_6px_10px_rgba(0,0,0,0.25)]"
                    >
                        { loading?"Loading...":isSignUp ? "Sign Up" : "Sign In"}
                    </button>

                    {/* Toggle Login/Signup */}
                    <p className="text-center mt-4 text-sm">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-orange-500 font-semibold hover:underline"
                        >
                            {isSignUp ? "Login" : "Sign Up"}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
