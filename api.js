import axios from "axios";

const apiPublic = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default apiPublic;