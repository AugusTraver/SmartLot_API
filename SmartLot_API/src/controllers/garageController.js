 // garageController.js
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import GarageService from './../services/garageService.js';
import Garage from './../entities/garage.js';

const router = Router();
const currentService = new GarageService();

export default router;