"use client";

import React, { useState, useEffect } from "react";
import logoFull from "@/assets/images/logo-full.svg";
import Image from "next/image";

export default function LoadingScreen() {
  const [numberOfDots, setNumberOfDots] = useState(1);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNumberOfDots((prev) => {
        return prev === 5 ? 1 : prev + 1;
      });
    }, 500);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="">
        <Image src={logoFull} alt="full logo" className="w-48 md:w-96 block" />
        <div className="flex justify-center gap-8 mt-10">
          {Array.from({ length: numberOfDots }).map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 md:w-4 md:h-4 bg-orange-500"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
