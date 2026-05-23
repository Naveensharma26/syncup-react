// src/socket.js
import { io } from "socket.io-client";
import API_URL from "../config";

// Point this to your Node.js backend port
const URL = API_URL;

export const socket = io(URL, {
  autoConnect: true, // The client will automatically connect as soon as the app loads
});
