// marcaController.js
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import MarcaService from './../services/marcaService.js';
import Marca from './../entities/marca.js';

const router = Router();
const currentService = new MarcaService();

export default router;