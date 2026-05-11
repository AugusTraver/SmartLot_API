import { Router } from 'express';
import EmpresaService from './../services/empresaService.js';
import Empresa from './../entities/empresa.js';

const router = Router();
const currentService = new EmpresaService();

export default router;