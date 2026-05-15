// garageController.js
import { Router } from 'express';
import GarageService from './../services/garageService.js';

const router = Router();
const svc = new GarageService();

router.get('', async (req, res) => {
    try {
        const data = await svc.getAllAsync();
        data != null ? res.status(200).json(data) : res.status(500).send('Error interno.');
    } catch (e) { res.status(500).send(`Error: ${e.message}`); }
});
router.get('/ocupacion_reserva/:id', async (req, res) => {
    try {
        const data = await svc.getOcupacionReservaAsync(req.params.id);
        data != null ? res.status(200).json(data) : res.status(500).send('Error interno.');
    } catch (e) { res.status(500).send(`Error: ${e.message}`); }
});

router.get('/ocupacion_no_reserva/:id', async (req, res) => {
    try {
        const data = await svc.getOcupacionNoReservaAsync(req.params.id);
        data != null ? res.status(200).json(data) : res.status(500).send('Error interno.');
    } catch (e) { res.status(500).send(`Error: ${e.message}`); }
});
router.get('/:id', async (req, res) => {
    try {
        const data = await svc.getByIdAsync(req.params.id);
        data != null ? res.status(200).json(data) : res.status(404).send('No encontrado.');
    } catch (e) { res.status(500).send(`Error: ${e.message}`); }
});

router.post('', async (req, res) => {
    try {
        const data = await svc.createAsync(req.body);
        data != null ? res.status(201).json(data) : res.status(500).send('Error interno.');
    } catch (e) { res.status(500).send(`Error: ${e.message}`); }
});

router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id); // Aseguramos que sea número
        
        if (isNaN(id)) {
            return res.status(400).send('El ID proporcionado no es válido.');
        }

        const data = await svc.updateAsync(id, req.body);

        if (data !== null) {
            res.status(200).json(data);
        } else {
            // Aquí entra si el ID no existe en la DB
            res.status(404).send('No encontrado: El garage con ese ID no existe.');
        }
    } catch (e) {
        // Aquí entrará si hay un error de SQL (ej: mandaste un string en un campo de número)
        console.error("Error en PUT /garage:", e.message);
        res.status(500).send(`Error de base de datos: ${e.message}`);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const ok = await svc.deleteAsync(req.params.id);
        ok ? res.status(200).send('Eliminado.') : res.status(404).send('No encontrado.');
    } catch (e) { res.status(500).send(`Error: ${e.message}`); }
});

export default router;
