import { Router } from 'express';
import GarageService from './../services/garageService.js';
import { isValidId, isValidString, isValidPositiveNumber } from '../helpers/validatorHelper.js';

const router = Router();
const svc = new GarageService();

// GET ALL
router.get('', async (req, res) => {
    try {
        const data = await svc.getAllAsync();
        data != null ? res.status(200).json(data) : res.status(500).send('Error interno.');
    } catch (e) { 
        console.error("Error en GET /garage:", e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

// GET OCUPACION RESERVA BY ID
router.get('/ocupacion_reserva/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).send('El ID proporcionado no es válido.');
        }

        const data = await svc.getOcupacionReservaAsync(id);
        data != null ? res.status(200).json(data) : res.status(404).send('No encontrado.');
    } catch (e) { 
        console.error(`Error en GET /garage/ocupacion_reserva/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

// GET OCUPACION NO RESERVA BY ID
router.get('/ocupacion_no_reserva/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).send('El ID proporcionado no es válido.');
        }

        const data = await svc.getOcupacionNoReservaAsync(id);
        data != null ? res.status(200).json(data) : res.status(404).send('No encontrado.');
    } catch (e) { 
        console.error(`Error en GET /garage/ocupacion_no_reserva/${req.params.id}:`, e.message);
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
        console.error(`Error en GET /garage/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

// CREATE (POST)
router.post('', async (req, res) => {
    try {
        const { id_sede, nombre, capacidad, estado } = req.body;
        if (!isValidString(nombre)) return res.status(400).send('El nombre es requerido.');
        if (!isValidId(String(id_sede))) return res.status(400).send('El id_sede es requerido y debe ser un número válido.');
        if (!isValidPositiveNumber(capacidad)) return res.status(400).send('La capacidad debe ser un número positivo.');
        if (estado !== undefined && typeof estado !== 'boolean') return res.status(400).send('El estado debe ser un valor booleano (true o false).');

        const data = await svc.createAsync(req.body);
        data != null ? res.status(201).json(data) : res.status(500).send('Error interno al crear el garage.');
    } catch (e) { 
        console.error("Error en POST /garage:", e.message);
        const status = e.statusCode || 500;
        res.status(status).send(`Error: ${e.message}`); 
    }
});

// UPDATE (PUT)
router.put('/:id', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).send('El ID proporcionado no es válido.');
        const { id_sede, nombre, capacidad, estado } = req.body;
        if (nombre !== undefined && !isValidString(nombre)) return res.status(400).send('El nombre no puede estar vacío.');
        if (id_sede !== undefined && !isValidId(String(id_sede))) return res.status(400).send('El id_sede debe ser un número válido.');
        if (capacidad !== undefined && !isValidPositiveNumber(capacidad)) return res.status(400).send('La capacidad debe ser un número positivo.');
        if (estado !== undefined && typeof estado !== 'boolean') return res.status(400).send('El estado debe ser un valor booleano (true o false).');

        const data = await svc.updateAsync(parseInt(req.params.id, 10), req.body);

        if (data !== null) {
            res.status(200).json(data);
        } else {
            res.status(404).send('No encontrado: El garage con ese ID no existe.');
        }
    } catch (e) {
        console.error(`Error en PUT /garage/${req.params.id}:`, e.message);
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
        ok ? res.status(200).send('Eliminado exitosamente.') : res.status(404).send('No encontrado: El garage con ese ID no existe.');
    } catch (e) { 
        console.error(`Error en DELETE /garage/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

// POST INGRESO VEHICULO SIN RESERVA
router.post('/:id/ingreso-no-reserva', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).send('El ID proporcionado no es válido.');
        }

        const data = await svc.registrarIngresoNoReservaAsync(id);
        data != null ? res.status(200).json(data) : res.status(404).send('No encontrado.');
    } catch (e) {
        console.error(`Error en POST /garage/${req.params.id}/ingreso-no-reserva:`, e.message);
        const status = e.statusCode || 500;
        res.status(status).send(`Error: ${e.message}`);
    }
});

// POST EGRESO VEHICULO SIN RESERVA
router.post('/:id/egreso-no-reserva', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).send('El ID proporcionado no es válido.');
        }

        const data = await svc.registrarEgresoNoReservaAsync(id);
        data != null ? res.status(200).json(data) : res.status(404).send('No encontrado.');
    } catch (e) {
        console.error(`Error en POST /garage/${req.params.id}/egreso-no-reserva:`, e.message);
        const status = e.statusCode || 500;
        res.status(status).send(`Error: ${e.message}`);
    }
});

export default router;