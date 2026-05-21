// sedeController.js
import { Router } from 'express';
import SedeService from './../services/sedeService.js';
import { isValidId, isValidString } from '../helpers/validatorHelper.js';

const router = Router();
const svc = new SedeService();

// GET ALL
router.get('', async (req, res) => {
    try {
        const data = await svc.getAllAsync();
        data != null ? res.status(200).json(data) : res.status(500).send('Error interno.');
    } catch (e) { 
        console.error("Error en GET /sede:", e.message);
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
        console.error(`Error en GET /sede/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

// CREATE (POST)
router.post('', async (req, res) => {
    try {
        const { nombre, id_empresa } = req.body;
        if (!isValidString(nombre)) return res.status(400).send('El nombre es requerido.');
        if (!isValidId(String(id_empresa))) return res.status(400).send('El id_empresa es requerido y debe ser un número válido.');

        const data = await svc.createAsync(req.body);
        data != null ? res.status(201).json(data) : res.status(500).send('Error interno al crear la sede.');
    } catch (e) { 
        console.error("Error en POST /sede:", e.message);
        const status = e.statusCode || 500;
        res.status(status).send(`Error: ${e.message}`); 
    }
});

// UPDATE (PUT)
router.put('/:id', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).send('El ID proporcionado no es válido.');
        const { nombre, id_empresa } = req.body;
        if (nombre !== undefined && !isValidString(nombre)) return res.status(400).send('El nombre no puede estar vacío.');
        if (id_empresa !== undefined && !isValidId(String(id_empresa))) return res.status(400).send('El id_empresa debe ser un número válido.');

        const data = await svc.updateAsync(parseInt(req.params.id, 10), req.body);

        if (data !== null) {
            res.status(200).json(data);
        } else {
            res.status(404).send('No encontrado: La sede con ese ID no existe.');
        }
    } catch (e) {
        console.error(`Error en PUT /sede/${req.params.id}:`, e.message);
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
        ok ? res.status(200).send('Eliminado exitosamente.') : res.status(404).send('No encontrado: La sede con ese ID no existe.');
    } catch (e) { 
        console.error(`Error en DELETE /sede/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

export default router;