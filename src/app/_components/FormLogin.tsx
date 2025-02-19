"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react"; // Import signIn from NextAuth.js
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export function FormLogin() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Call signIn with 'credentials' provider
    const result = await signIn("credentials", {
      redirect: false, // Disable automatic redirect
      username: values.username,
      password: values.password,
    });

    // Handle the response from signIn
    if (result?.error) {
      alert("Login failed: " + result.error);
    } else {
      window.location.href = "/"; // Redirect to home page or dashboard after success
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <section>
          <p>Don&apos;t have an account?</p>
          <Link href="/register">Register</Link>
        </section>
        <Button type="submit">Submit</Button>
      </form>
      <section className="flex gap-4">
        <div className="h-[1px] w-full bg-gray-400"></div>
        <p>Or</p>
        <div className="h-[1px] w-full bg-gray-400"></div>
      </section>
      <Button onClick={() => signIn("google")}>Login with Google</Button>
      <Button onClick={() => signIn("discord")}>Login with Discord</Button>
    </Form>
  );
}
