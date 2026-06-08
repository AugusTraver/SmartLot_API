import { Router } from 'express';
import GarageService from './../services/garageService.js';
import { isValidId, isValidString, isValidPositiveNumber } from '../helpers/validatorHelper.js';
import { requireRole } from '../middlewares/rolesMiddleware.js';

const router = Router();
const svc = new GarageService();

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

// GET OCUPACION RESERVA BY ID
router.get('/ocupacion_reserva/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const data = await svc.getOcupacionReservaAsync(id);
    if (!data) throwError('No encontrado.', 404);
    res.status(200).json(data);
});

// GET OCUPACION NO RESERVA BY ID
router.get('/ocupacion_no_reserva/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const data = await svc.getOcupacionNoReservaAsync(id);
    if (!data) throwError('No encontrado.', 404);
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
router.post('', requireRole(1, 4), async (req, res) => {
    const { id_sede, nombre, capacidad, estado } = req.body;
    if (!isValidString(nombre)) throwError('El nombre es requerido.', 400);
    if (!isValidId(String(id_sede))) throwError('El id_sede es requerido y debe ser un número válido.', 400);
    if (!isValidPositiveNumber(capacidad)) throwError('La capacidad debe ser un número positivo.', 400);
    if (estado !== undefined && typeof estado !== 'boolean') throwError('El estado debe ser un valor booleano (true o false).', 400);

    const data = await svc.createAsync(req.body);
    if (!data) throwError('Error interno al crear el garage.', 500);
    res.status(201).json(data);
});

// UPDATE (PUT)
router.put('/:id', requireRole(1, 4), async (req, res) => {
    if (!isValidId(req.params.id)) throwError('El ID proporcionado no es válido.', 400);
    const { id_sede, nombre, capacidad, estado } = req.body;
    if (nombre !== undefined && !isValidString(nombre)) throwError('El nombre no puede estar vacío.', 400);
    if (id_sede !== undefined && !isValidId(String(id_sede))) throwError('El id_sede debe ser un número válido.', 400);
    if (capacidad !== undefined && !isValidPositiveNumber(capacidad)) throwError('La capacidad debe ser un número positivo.', 400);
    if (estado !== undefined && typeof estado !== 'boolean') throwError('El estado debe ser un valor booleano (true o false).', 400);

    const data = await svc.updateAsync(parseInt(req.params.id, 10), req.body);
    if (!data) throwError('No encontrado: El garage con ese ID no existe.', 404);
    res.status(200).json(data);
});

// DELETE
router.delete('/:id', requireRole(1, 4), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const ok = await svc.deleteAsync(id);
    if (!ok) throwError('No encontrado: El garage con ese ID no existe.', 404);
    res.status(200).json({ message: 'Eliminado exitosamente.' });
});

// POST INGRESO VEHICULO SIN RESERVA
router.post('/:id/ingreso-no-reserva', requireRole(1, 3, 4), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const data = await svc.registrarIngresoNoReservaAsync(id);
    if (!data) throwError('No encontrado.', 404);
    res.status(200).json(data);
});

// POST EGRESO VEHICULO SIN RESERVA
router.post('/:id/egreso-no-reserva', requireRole(1, 3, 4), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const data = await svc.registrarEgresoNoReservaAsync(id);
    if (!data) throwError('No encontrado.', 404);
    res.status(200).json(data);
});

export default router;
