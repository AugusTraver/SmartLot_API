// rolController.js
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import RolService from './../services/rolService.js';
import Rol from './../entities/rol.js';

const router = Router();
const currentService = new RolService();

export default router;