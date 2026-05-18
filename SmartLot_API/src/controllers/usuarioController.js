// usuarioController.js
import { Router } from 'express';
import UsuarioService from './../services/usuarioService.js';
import { isValidId, isValidEmail, isValidString, isValidPassword } from '../helpers/validatorHelper.js';

const router = Router();
const svc = new UsuarioService();

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
        console.error(`Error en GET /usuario/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`);
    }
});

// CREATE (POST)
router.post('', async (req, res) => {
    try {
        const { id_rol, nombre, apellido, id_sede, email, telefono, contraseña, id_empresa } = req.body;

        // 1. Validaciones básicas de los datos de entrada
        if (!isValidString(nombre)) return res.status(400).send('El nombre es requerido.');
        if (!isValidString(apellido)) return res.status(400).send('El apellido es requerido.');
        if (!isValidEmail(email)) return res.status(400).send('El email no tiene un formato válido.');
        if (!isValidPassword(contraseña)) return res.status(400).send('La contraseña debe tener al menos 6 caracteres.');
        // Puedes agregar más validaciones para id_rol, id_sede, etc. usando isValidId si son obligatorios

        const data = await svc.createAsync(req.body);
        data != null ? res.status(201).json(data) : res.status(500).send('Error interno al crear el usuario.');
    } catch (e) { 
        console.error("Error en POST /usuario:", e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

// UPDATE (PUT)
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // 1. Validar el ID de la URL
        if (!isValidId(id)) {
            return res.status(400).send('El ID proporcionado no es válido.');
        }

        // 2. Validaciones básicas del body (igual que en el POST, o podrías flexibilizarlas si permites actualizaciones parciales)
        const { email, contraseña } = req.body;
        if (email && !isValidEmail(email)) return res.status(400).send('El email no tiene un formato válido.');
        if (contraseña && !isValidPassword(contraseña)) return res.status(400).send('La contraseña debe tener al menos 6 caracteres.');

        const data = await svc.updateAsync(parseInt(id, 10), req.body);

        if (data !== null) {
            res.status(200).json(data);
        } else {
            res.status(404).send('No encontrado: El usuario con ese ID no existe.');
        }
    } catch (e) {
        console.error(`Error en PUT /usuario/${req.params.id}:`, e.message);
        res.status(500).send(`Error de base de datos: ${e.message}`);
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // 1. Validar el ID
        if (!isValidId(id)) {
            return res.status(400).send('El ID proporcionado no es válido.');
        }

        const ok = await svc.deleteAsync(parseInt(id, 10));
        ok ? res.status(200).send('Usuario eliminado exitosamente.') : res.status(404).send('No encontrado: El usuario con ese ID no existe.');
    } catch (e) { 
        console.error(`Error en DELETE /usuario/${req.params.id}:`, e.message);
        res.status(500).send(`Error: ${e.message}`); 
    }
});

export default router;