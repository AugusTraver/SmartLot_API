import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import EmpresaService from './../services/empresaService.js';
import Empresa from './../entities/empresa.js';

const router = Router();
const currentService = new EmpresaService();

export default router;