import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJWT';

import { auth } from './auth.route';
import { user } from './user.route';
import { property } from './property.route';
import { permission } from './permission.route';
import { propertyDocuments } from './propertyDocuments.route';
import { propertyPhoto } from './propertyPhoto.route';

export const apiV1Router = Router();

// tratado de proteção de rodas realizado separadamente  
apiV1Router.use("/auth", auth);

// rotas protegidas pelo "verifyJWT"
apiV1Router.use("/user", verifyJWT, user);
apiV1Router.use("/property", verifyJWT, property);
apiV1Router.use("/permission", verifyJWT, permission);
apiV1Router.use("/propertyDocuments", verifyJWT, propertyDocuments);
apiV1Router.use("/propertyPhoto", verifyJWT, propertyPhoto);