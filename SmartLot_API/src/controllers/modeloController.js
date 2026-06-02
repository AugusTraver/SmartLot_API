import { Router } from 'express';
import ModeloService from './../services/modeloService.js';
import { isValidId, isValidString } from '../helpers/validatorHelper.js';

const router = Router();
const svc = new ModeloService();

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
router.post('', async (req, res) => {
    const { nombre, id_marca } = req.body;
    if (!isValidString(nombre)) throwError('El nombre es requerido.', 400);
    if (!isValidId(String(id_marca))) throwError('El id_marca es requerido y debe ser un número válido.', 400);

    const data = await svc.createAsync(req.body);
    if (!data) throwError('Error interno al crear el modelo.', 500);
    res.status(201).json(data);
});

// UPDATE (PUT)
router.put('/:id', async (req, res) => {
    if (!isValidId(req.params.id)) throwError('El ID proporcionado no es válido.', 400);
    const { nombre, id_marca } = req.body;
    if (nombre !== undefined && !isValidString(nombre)) throwError('El nombre no puede estar vacío.', 400);
    if (id_marca !== undefined && !isValidId(String(id_marca))) throwError('El id_marca debe ser un número válido.', 400);

    const data = await svc.updateAsync(parseInt(req.params.id, 10), req.body);
    if (!data) throwError('No encontrado: El modelo con ese ID no existe.', 404);
    res.status(200).json(data);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const ok = await svc.deleteAsync(id);
    if (!ok) throwError('No encontrado: El modelo con ese ID no existe.', 404);
    res.status(200).json({ message: 'Eliminado exitosamente.' });
});

export default router;
