"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authAPI, RegisterData } from "@/lib/auth";
import { Mail, Lock, User } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    username: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== confirmPassword) {
      setError("Password confirmation does not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.register(formData);
      // Auto login after successful registration
      await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      router.push("/"); // Redirect to home page after successful registration
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-purple-400"
              placeholder="Please enter your email"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-purple-400"
              placeholder="Please enter your username"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-purple-400"
              placeholder="Please enter your password (at least 6 characters)"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={handleInputChange}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-purple-400"
              placeholder="Please enter your password again"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}
