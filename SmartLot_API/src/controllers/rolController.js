import { Router } from 'express';
import RolService from './../services/rolService.js';
import { isValidId, isValidString } from '../helpers/validatorHelper.js';
import { requireRole } from '../middlewares/rolesMiddleware.js';

const router = Router();
const svc = new RolService();

function throwError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
}

// GET ALL
router.get('', async (req, res) => {
    const data = await svc.getAllAsync();
    if (!data) throwError('Error interno del servidor', 500);
    res.status(200).json(data);
});

// GET BY ID
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const data = await svc.getByIdAsync(id);
    if (!data) throwError('No encontrado.', 404);
    res.status(200).json(data);
});

// CREATE (POST)
router.post('', requireRole(4), async (req, res) => {
    const { tipo_rol } = req.body;
    if (!isValidString(tipo_rol)) throwError('El tipo_rol es requerido.', 400);

    const data = await svc.createAsync(req.body);
    if (!data) throwError('Error interno al crear el rol.', 500);
    res.status(201).json(data);
});

// UPDATE (PUT)
router.put('/:id', requireRole(4), async (req, res) => {
    if (!isValidId(req.params.id)) throwError('El ID proporcionado no es válido.', 400);
    const { tipo_rol } = req.body;
    if (tipo_rol !== undefined && !isValidString(tipo_rol)) throwError('El tipo_rol no puede estar vacío.', 400);

    const data = await svc.updateAsync(parseInt(req.params.id, 10), req.body);
    if (!data) throwError('No encontrado: El rol con ese ID no existe.', 404);
    res.status(200).json(data);
});

// DELETE
router.delete('/:id', requireRole(4), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const ok = await svc.deleteAsync(id, req.usuario);
    if (!ok) throwError('No encontrado: El rol con ese ID no existe.', 404);
    res.status(200).json({ message: 'Eliminado exitosamente.' });
});

export default router;
