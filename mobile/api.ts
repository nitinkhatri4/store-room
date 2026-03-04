import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Change this to your Railway/production URL before building
const BASE_URL = __DEV__
  ? "http://192.168.29.94:5000/api"
  : "https://store-room-production.up.railway.app/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
