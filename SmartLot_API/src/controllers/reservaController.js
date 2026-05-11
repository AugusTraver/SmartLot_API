// reservaController.js
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ReservaService from './../services/reservaService.js';
import Reserva from './../entities/reserva.js';

const router = Router();
const currentService = new ReservaService();

export default router;