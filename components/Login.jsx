import Image from 'next/image';
import React from 'react';

const Login = () => {
  return (
    <div className="bg-[url('/Login/checksBack.png')] md:bg-white relative flex justify-center items-center bg-cover bg-center bg-no-repeat min-h-screen">
      
      {/* Decorative Image */}
      <div className="absolute bottom-0 left-[calc(-30%)] sm:left-[calc(-15%)] z-1000">
        <Image
          src="/Login/cheif.png"
          height={700}
          width={700}
          alt="Decorative chef image"
          className="object-contain w-[100vw] h-[40vh]"
        />
      </div>

      {/* Login Card */}
      <div className="w-[94vw] max-w-md h-[50vh] bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between mx-auto z-10">
        
        {/* Heading */}
        <h1 
        className="font-extrabold text-5xl text-center   text-orange-500/90 mb-6">
          Login
        </h1>

        {/* Input Fields */}
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              className="w-full p-3 text-xl font-bold border-b-2 border-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full p-3 text-xl font-bold border-b-2 border-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Remember me + Forgot Password */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 accent-orange-500" />
            Remember me
          </label>
          <a href="#" className="text-orange-500 hover:underline">Forgot Password?</a>
        </div>

        {/* Login Button */}
        <button className="w-[150px] mx-auto mt-6 bg-[#FE8D3C] text-white py-3 rounded font-bold drop-shadow-2xl hover:bg-orange-600 transition">
          Sign In
        </button>
      </div>
    </div>
  );
};

export default Login;
