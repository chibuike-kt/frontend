import axios from "./axios";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "host" | "guest";
  created_at: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "host" | "guest";
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Fetch the CSRF cookie before any state-mutating request
async function getCsrfCookie(): Promise<void> {
  await axios.get("/sanctum/csrf-cookie");
}

export async function register(payload: RegisterPayload): Promise<User> {
  await getCsrfCookie();
  const response = await axios.post("/api/register", payload);
  return response.data.user;
}

export async function login(payload: LoginPayload): Promise<User> {
  await getCsrfCookie();
  await axios.post("/api/login", payload);
  const userResponse = await axios.get("/api/user");
  return userResponse.data.user;
}

export async function logout(): Promise<void> {
  await axios.post("/api/logout");
}

export async function getUser(): Promise<User | null> {
  try {
    const response = await axios.get("/api/user");
    return response.data.user;
  } catch {
    return null;
  }
}
