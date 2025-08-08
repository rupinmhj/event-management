// src/hooks/useAxiosAuth.js
import { useContext, useMemo } from "react";
import axios from "axios";
import AuthContext from "../Context/authContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function useAxiosAuth() {
  const { authTokens, logout, login } = useContext(AuthContext);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: BASE_URL });

    // 1. Request: attach token
    instance.interceptors.request.use((config) => {
      if (authTokens) {
        config.headers.Authorization = `Bearer ${authTokens}`;
        console.log("Authorization header set:", config.headers.Authorization);
      } else {
        console.log("No auth token found");
      }
      return config;
    });



    return instance;
  }, [authTokens, login, logout]);

 

  return api;
}