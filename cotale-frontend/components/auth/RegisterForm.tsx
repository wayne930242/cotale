"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User } from "lucide-react";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authService } from "@/lib/services/auth.service";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [submitError, setSubmitError] = useState("");

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormData) => {
    setSubmitError("");

    try {
      // Register user
      await authService.register({
        email: values.email,
        username: values.username,
        password: values.password,
      });

      // Auto login after successful registration
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setSubmitError("Registration successful but login failed");
      } else {
        router.push(redirectTo);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {submitError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
            {submitError}
          </div>
        )}

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-300">
                  Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="Please enter your email"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-purple-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-300">
                  Username
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Please enter your username"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-purple-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-300">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="Please enter your password"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-purple-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-slate-300">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="Please confirm your password"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-purple-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-sm" />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-3 transition-all duration-200"
        >
          {form.formState.isSubmitting ? "Creating account..." : "Register"}
        </Button>
      </form>
    </Form>
  );
}

export default function RegisterForm() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
