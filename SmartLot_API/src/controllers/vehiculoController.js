// vehiculoController.js
import { Router } from 'express';
import VehiculoService from './../services/vehiculoService.js';
import Vehiculo from './../entities/vehiculo.js';

const router = Router();
const currentService = new VehiculoService();

export default router;