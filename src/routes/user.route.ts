import express from "express";
import { getUser } from "../controllers/User/get.User.controller";
import { updateUser } from "../controllers/User/update.User.controller";
import { deleteUser } from "../controllers/User/delete.User.controller";

export const user = express.Router();

user.get("/", getUser);
user.put("/:id", updateUser);
user.delete("/:userId", deleteUser);