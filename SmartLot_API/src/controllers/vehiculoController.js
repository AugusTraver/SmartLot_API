// vehiculoController.js
import { Router } from 'express';
import VehiculoService from './../services/vehiculoService.js';
import { isValidId, isValidPatente } from '../helpers/validatorHelper.js';

const router = Router();
const svc = new VehiculoService();


// GET ALL
router.get('', async (req, res) => {
    try {
        const data = await svc.getAllAsync();
        data != null ? res.status(200).json(data) : res.status(500).send('Error interno.');
    } catch (e) { 
        console.error("Error en GET /vehiculo:", e.message);
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
        console.error(`Error en GET /vehiculo/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

// CREATE (POST)
router.post('', async (req, res) => {
    try {
        const { id_usuario, id_modelo, patente } = req.body;
        console.log("POST /vehiculo - Payload recibido:", req.body);
        if (!isValidId(String(id_usuario))) return res.status(400).send('El id_usuario es requerido y debe ser un número válido.');
        if (!isValidId(String(id_modelo))) return res.status(400).send('El id_modelo es requerido y debe ser un número válido.');
        if (!isValidPatente(patente)) return res.status(400).send('La patente es requerida y debe tener formato válido (ABC123 o AB123CD).');

        const data = await svc.createAsync(req.body);
        data != null ? res.status(201).json(data) : res.status(500).send('Error interno al crear el vehículo.');
    } catch (e) { 
        console.error("Error en POST /vehiculo:", e.message);
        const status = e.statusCode || 500;
        res.status(status).send(`Error: ${e.message}`); 
    }
});

// UPDATE (PUT)
router.put('/:id', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).send('El ID proporcionado no es válido.');
        const { id_usuario, id_modelo, patente } = req.body;
        if (id_usuario !== undefined && !isValidId(String(id_usuario))) return res.status(400).send('El id_usuario debe ser un número válido.');
        if (id_modelo !== undefined && !isValidId(String(id_modelo))) return res.status(400).send('El id_modelo debe ser un número válido.');
        if (patente !== undefined && !isValidPatente(patente)) return res.status(400).send('La patente debe tener formato válido (ABC123 o AB123CD).');

        const data = await svc.updateAsync(parseInt(req.params.id, 10), req.body);

        if (data !== null) {
            res.status(200).json(data);
        } else {
            res.status(404).send('No encontrado: El vehículo con ese ID no existe.');
        }
    } catch (e) {
        console.error(`Error en PUT /vehiculo/${req.params.id}:`, e.message);
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
        ok ? res.status(200).send('Eliminado exitosamente.') : res.status(404).send('No encontrado: El vehículo con ese ID no existe.');
    } catch (e) { 
        console.error(`Error en DELETE /vehiculo/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

export default router;
