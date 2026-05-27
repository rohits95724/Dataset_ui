"use client";
import dynamic from "next/dynamic";

const Login = dynamic(() => import("./Login"), {
  ssr: false,
});

export default function LoginHOC() {
  return <Login />;
}
