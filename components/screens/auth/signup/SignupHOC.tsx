"use client";
import dynamic from "next/dynamic";

const Signup = dynamic(() => import("./Signup"), {
  ssr: false,
});

export default function SignupHOC() {
  return <Signup />;
}
