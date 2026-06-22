// conflictoController.js
import { Router } from 'express';
import ConflictoService from './../services/ConflictoService.js';
import { isValidId, isValidString } from '../helpers/validatorHelper.js';
import { requireRole } from '../middlewares/rolesMiddleware.js';

const router = Router();
const svc = new ConflictoService();

const PRIORIDADES_VALIDAS = ['Baja', 'Media', 'Alta'];
const ESTADOS_VALIDOS = ['Pendiente', 'En Proceso', 'Resuelto'];

function throwError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
}

// GET ALL
router.get('', requireRole(1, 4), async (req, res) => {
    const data = await svc.getAllAsync();
    if (!data) throwError('Error interno del servidor', 500);
    res.status(200).json(data);
});

// GET BY ID
router.get('/:id', requireRole(1, 4), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const data = await svc.getByIdAsync(id);
    if (!data) throwError('No encontrado.', 404);
    res.status(200).json(data);
});

// CREATE (POST)
router.post('', requireRole(1, 2, 4), async (req, res) => {
    if (Number(req.usuario?.id_rol) === 2) {
        req.body.id_usuario = req.usuario.id;
    }

    const { id_usuario, descripcion, prioridad } = req.body;

    if (!isValidId(String(id_usuario))) throwError('El id_usuario es requerido y debe ser un número válido.', 400);
    if (!isValidString(descripcion)) throwError('La descripción es requerida.', 400);
    if (!prioridad || !PRIORIDADES_VALIDAS.includes(prioridad)) {
        throwError(`La prioridad debe ser una de: ${PRIORIDADES_VALIDAS.join(', ')}.`, 400);
    }

    const data = await svc.createAsync(req.body);
    if (!data) throwError('Error interno al crear el conflicto.', 500);
    res.status(201).json(data);
});

// UPDATE (PUT)
router.put('/:id', requireRole(1, 4), async (req, res) => {
    if (!isValidId(req.params.id)) throwError('El ID proporcionado no es válido.', 400);

    const { id_usuario, descripcion, prioridad, estado } = req.body;

    if (id_usuario !== undefined && !isValidId(String(id_usuario))) {
        throwError('El id_usuario debe ser un número válido.', 400);
    }
    if (descripcion !== undefined && !isValidString(descripcion)) {
        throwError('La descripción no puede estar vacía.', 400);
    }
    if (prioridad !== undefined && !PRIORIDADES_VALIDAS.includes(prioridad)) {
        throwError(`La prioridad debe ser una de: ${PRIORIDADES_VALIDAS.join(', ')}.`, 400);
    }
    if (estado !== undefined && !ESTADOS_VALIDOS.includes(estado)) {
        throwError(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}.`, 400);
    }

    const data = await svc.updateAsync(parseInt(req.params.id, 10), req.body);
    if (!data) throwError('No encontrado: El conflicto con ese ID no existe.', 404);
    res.status(200).json(data);
});

// DELETE
router.delete('/:id', requireRole(1, 4), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const ok = await svc.deleteAsync(id);
    if (!ok) throwError('No encontrado: El conflicto con ese ID no existe.', 404);
    res.status(200).json({ message: 'Eliminado exitosamente.' });
});

export default router;
