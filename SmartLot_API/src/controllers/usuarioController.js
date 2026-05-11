// usuarioController.js
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import UsuarioService from './../services/usuarioService.js';
import Usuario from './../entities/usuario.js';

const router = Router();
const currentService = new UsuarioService();

export default router;