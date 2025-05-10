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
apiV1Router.use("/user", user);
apiV1Router.use("/property", property);
apiV1Router.use("/permission", permission);
apiV1Router.use("/propertyDocuments", propertyDocuments);
apiV1Router.use("/propertyPhoto", propertyPhoto);