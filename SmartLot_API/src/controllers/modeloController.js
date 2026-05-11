// modeloController.js
import { Router } from 'express';
import ModeloService from './../services/modeloService.js';
import Modelo from './../entities/modelo.js';

const router = Router();
const currentService = new ModeloService();

export default router;