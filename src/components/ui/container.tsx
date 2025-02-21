import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function Container({ children }: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
      {children}
    </main>
  );
}
