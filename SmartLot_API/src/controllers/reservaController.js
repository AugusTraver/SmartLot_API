// reservaController.js
import { Router } from 'express';
import ReservaService from './../services/reservaService.js';
import { isValidId, isValidDate } from '../helpers/validatorHelper.js';

const router = Router();
const svc = new ReservaService();


// GET ALL
router.get('', async (req, res) => {
    try {
        const data = await svc.getAllAsync();
        data != null ? res.status(200).json(data) : res.status(500).send('Error interno.');
    } catch (e) { 
        console.error("Error en GET /reserva:", e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

// GET BY ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).send('El ID proporcionado no es válido.');
        }

        const data = await svc.getByIdAsync(id);
        data != null ? res.status(200).json(data) : res.status(404).send('No encontrado.');
    } catch (e) { 
        console.error(`Error en GET /reserva/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

// CREATE (POST)
router.post('', async (req, res) => {
    try {
        const { id_usuario, id_garage, id_vehiculo, fecha_entrada, fecha_salida } = req.body;
        if (!isValidId(String(id_usuario))) return res.status(400).send('El id_usuario es requerido y debe ser un número válido.');
        if (!isValidId(String(id_garage))) return res.status(400).send('El id_garage es requerido y debe ser un número válido.');
        if (!isValidId(String(id_vehiculo))) return res.status(400).send('El id_vehiculo es requerido y debe ser un número válido.');
        if (!isValidDate(fecha_entrada)) return res.status(400).send('La fecha de entrada es requerida y debe ser una fecha válida.');
        if (!isValidDate(fecha_salida)) return res.status(400).send('La fecha de salida es requerida y debe ser una fecha válida.');

        const data = await svc.createAsync(req.body);
        data != null ? res.status(201).json(data) : res.status(500).send('Error interno al crear la reserva.');
    } catch (e) { 
        console.error("Error en POST /reserva:", e.message);
        const status = e.statusCode || 500;
        res.status(status).send(`Error: ${e.message}`); 
    }
});

// UPDATE (PUT)
router.put('/:id', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).send('El ID proporcionado no es válido.');
        const { id_usuario, id_garage, id_vehiculo, fecha_entrada, fecha_salida } = req.body;
        if (id_usuario !== undefined && !isValidId(String(id_usuario))) return res.status(400).send('El id_usuario debe ser un número válido.');
        if (id_garage !== undefined && !isValidId(String(id_garage))) return res.status(400).send('El id_garage debe ser un número válido.');
        if (id_vehiculo !== undefined && !isValidId(String(id_vehiculo))) return res.status(400).send('El id_vehiculo debe ser un número válido.');
        if (fecha_entrada !== undefined && !isValidDate(fecha_entrada)) return res.status(400).send('La fecha de entrada debe ser una fecha válida.');
        if (fecha_salida !== undefined && !isValidDate(fecha_salida)) return res.status(400).send('La fecha de salida debe ser una fecha válida.');

        const data = await svc.updateAsync(parseInt(req.params.id, 10), req.body);

        if (data !== null) {
            res.status(200).json(data);
        } else {
            res.status(404).send('No encontrado: La reserva con ese ID no existe.');
        }
    } catch (e) {
        console.error(`Error en PUT /reserva/${req.params.id}:`, e.message);
        const status = e.statusCode || 500;
        res.status(status).send(`Error: ${e.message}`);
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).send('El ID proporcionado no es válido.');
        }

        const ok = await svc.deleteAsync(id);
        ok ? res.status(200).send('Eliminado exitosamente.') : res.status(404).send('No encontrado: La reserva con ese ID no existe.');
    } catch (e) { 
        console.error(`Error en DELETE /reserva/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

export default router;