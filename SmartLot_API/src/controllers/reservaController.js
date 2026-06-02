import { Router } from 'express';
import ReservaService from './../services/reservaService.js';
import { isValidId, isValidDate } from '../helpers/validatorHelper.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { requireRole, requireAdmin } from '../middlewares/rolesMiddleware.js';

const router = Router();
const svc = new ReservaService();

function throwError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
}

/**
 * Convencion de roles (verificar contra la tabla `roles`):
 *   1 = admin
 *   2 = cliente
 *   3 = garagista
 */

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
router.post('', async (req, res) => {
    const body = req.body ?? {};
    const { id_usuario, id_garage, id_vehiculo, fecha_entrada, fecha_salida } = body;
    if (!isValidId(String(id_usuario))) throwError('El id_usuario es requerido y debe ser un número válido.', 400);
    if (!isValidId(String(id_garage))) throwError('El id_garage es requerido y debe ser un número válido.', 400);
    if (!isValidId(String(id_vehiculo))) throwError('El id_vehiculo es requerido y debe ser un número válido.', 400);
    if (!isValidDate(fecha_entrada)) throwError('La fecha de entrada es requerida y debe ser una fecha válida.', 400);
    if (!isValidDate(fecha_salida)) throwError('La fecha de salida es requerida y debe ser una fecha válida.', 400);

    const data = await svc.createAsync(body);
    if (!data) throwError('Error interno al crear la reserva.', 500);
    res.status(201).json(data);
});

// UPDATE (PUT)
router.put('/:id', async (req, res) => {
    if (!isValidId(req.params.id)) throwError('El ID proporcionado no es válido.', 400);
    const body = req.body ?? {};
    const { id_usuario, id_garage, id_vehiculo, fecha_entrada, fecha_salida } = body;
    if (id_usuario !== undefined && !isValidId(String(id_usuario))) throwError('El id_usuario debe ser un número válido.', 400);
    if (id_garage !== undefined && !isValidId(String(id_garage))) throwError('El id_garage debe ser un número válido.', 400);
    if (id_vehiculo !== undefined && !isValidId(String(id_vehiculo))) throwError('El id_vehiculo debe ser un número válido.', 400);
    if (fecha_entrada !== undefined && !isValidDate(fecha_entrada)) throwError('La fecha de entrada debe ser una fecha válida.', 400);
    if (fecha_salida !== undefined && !isValidDate(fecha_salida)) throwError('La fecha de salida debe ser una fecha válida.', 400);

    const data = await svc.updateAsync(parseInt(req.params.id, 10), body);
    if (!data) throwError('No encontrado: La reserva con ese ID no existe.', 404);
    res.status(200).json(data);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const ok = await svc.deleteAsync(id);
    if (!ok) throwError('No encontrado: La reserva con ese ID no existe.', 404);
    res.status(200).json({ message: 'Eliminado exitosamente.' });
});

// POST CANCEL (admin o cliente dueño de la reserva)
router.post('/:id/cancel', authMiddleware, requireRole(1, 2), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const ok = await svc.cancelarAsync(id);
    if (!ok) throwError('No encontrado: La reserva con ese ID no existe.', 404);
    res.status(200).json({ message: 'Reserva cancelada exitosamente.' });
});

// POST CHECK-IN (admin o garagista)
router.post('/:id/check-in', authMiddleware, requireRole(1, 3), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const data = await svc.checkInAsync(id);
    if (!data) throwError('No encontrado.', 404);
    res.status(200).json(data);
});

// POST CHECK-OUT (admin o garagista)
router.post('/:id/check-out', authMiddleware, requireRole(1, 3), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const data = await svc.checkOutAsync(id);
    if (!data) throwError('No encontrado.', 404);
    res.status(200).json(data);
});

export default router;
