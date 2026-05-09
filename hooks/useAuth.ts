"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  getUser,
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  LoginPayload,
  RegisterPayload,
} from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    const currentUser = await getUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (payload: LoginPayload) => {
    const loggedInUser = await authLogin(payload);
    setUser(loggedInUser);
    router.push("/dashboard");
    return loggedInUser;
  };

  const register = async (payload: RegisterPayload) => {
    const newUser = await authRegister(payload);
    setUser(newUser);
    router.push("/dashboard");
    return newUser;
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
    router.push("/login");
  };

  return { user, loading, login, register, logout };
}
