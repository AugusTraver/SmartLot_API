// sedeController.js
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import SedeService from './../services/sedeService.js';
import Sede from './../entities/sede.js';

const router = Router();
const currentService = new SedeService();

export default router;