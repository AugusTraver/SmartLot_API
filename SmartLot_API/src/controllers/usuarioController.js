// usuarioController.js
import { Router } from 'express';
import UsuarioService from './../services/usuarioService.js';

const router = Router();
const svc = new UsuarioService();

router.get('', async (req, res) => {
    try {
        const data = await svc.getAllAsync();
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
        const data = await svc.updateAsync(req.params.id, req.body);
        data != null ? res.status(200).json(data) : res.status(404).send('No encontrado.');
    } catch (e) { res.status(500).send(`Error: ${e.message}`); }
});

router.delete('/:id', async (req, res) => {
    try {
        const ok = await svc.deleteAsync(req.params.id);
        ok ? res.status(200).send('Eliminado.') : res.status(404).send('No encontrado.');
    } catch (e) { res.status(500).send(`Error: ${e.message}`); }
});

export default router;
