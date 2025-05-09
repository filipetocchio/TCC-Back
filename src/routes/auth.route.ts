import express from "express";
import { verifyJWT } from '../middleware/verifyJWT';
import { registerAuth } from "../controllers/Auth/register.controller";
import { loginAuth } from "../controllers/Auth/login.Auth.controller";
import { logoutAuth } from "../controllers/Auth/logout.Auth.controller";
// import { refreshTokenAuth } from "../controllers/Auth/refreshToken.Auth.controller";

export const auth = express.Router();

// Rotdas Públicas
auth.post("/register", registerAuth);
auth.post("/login", loginAuth);

// Rotas protegidas
auth.post("/logout", verifyJWT, logoutAuth);
// auth.post("/refresh", verifyJWT, refreshTokenAuth);