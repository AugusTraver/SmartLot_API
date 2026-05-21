// modeloController.js
import { Router } from 'express';
import ModeloService from './../services/modeloService.js';
import { isValidId, isValidString } from '../helpers/validatorHelper.js';

const router = Router();
const svc = new ModeloService();


// GET ALL
router.get('', async (req, res) => {
    try {
        const data = await svc.getAllAsync();
        data != null ? res.status(200).json(data) : res.status(500).send('Error interno.');
    } catch (e) { 
        console.error("Error en GET /modelo:", e.message);
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
        console.error(`Error en GET /modelo/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

// CREATE (POST)
router.post('', async (req, res) => {
    try {
        const { nombre, id_marca } = req.body;
        if (!isValidString(nombre)) return res.status(400).send('El nombre es requerido.');
        if (!isValidId(String(id_marca))) return res.status(400).send('El id_marca es requerido y debe ser un número válido.');

        const data = await svc.createAsync(req.body);
        data != null ? res.status(201).json(data) : res.status(500).send('Error interno al crear el modelo.');
    } catch (e) { 
        console.error("Error en POST /modelo:", e.message);
        const status = e.statusCode || 500;
        res.status(status).send(`Error: ${e.message}`); 
    }
});

// UPDATE (PUT)
router.put('/:id', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).send('El ID proporcionado no es válido.');
        const { nombre, id_marca } = req.body;
        if (nombre !== undefined && !isValidString(nombre)) return res.status(400).send('El nombre no puede estar vacío.');
        if (id_marca !== undefined && !isValidId(String(id_marca))) return res.status(400).send('El id_marca debe ser un número válido.');

        const data = await svc.updateAsync(parseInt(req.params.id, 10), req.body);

        if (data !== null) {
            res.status(200).json(data);
        } else {
            res.status(404).send('No encontrado: El modelo con ese ID no existe.');
        }
    } catch (e) {
        console.error(`Error en PUT /modelo/${req.params.id}:`, e.message);
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
        ok ? res.status(200).send('Eliminado exitosamente.') : res.status(404).send('No encontrado: El modelo con ese ID no existe.');
    } catch (e) { 
        console.error(`Error en DELETE /modelo/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

export default router;
