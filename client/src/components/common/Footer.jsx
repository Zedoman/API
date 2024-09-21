import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';


const Footer = () => {


  return (
    <div className="min-h-screen flex flex-col">
  {/* Your main content goes here */}
  <main className="flex-grow">
    {/* Content */}
  </main>

  <footer className="bg-[#111111] max-w-full text-gray-300 p-8 mt-5">
    <ToastContainer />
    <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-8">
      {/* Footer content */}
    </div>
  </footer>
</div>

  );
};

export default Footer;
