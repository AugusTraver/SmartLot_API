import { Router } from 'express';
import GarageService from './../services/garageService.js';
import { obtenerGaragesCercanosConTiempoReal } from './../services/geolocalizacionService.js';
import { isValidId, isValidString, isValidPositiveNumber, isValidTime, isValidDiaSemana } from '../helpers/validatorHelper.js';
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

// GET CERCANOS - Garages cercanos con tiempos reales usando Distance Matrix
router.get('/:id/cercanos', requireRole(1, 4), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const sede = await svc.sedeService.getByIdAsync(id);
    if (!sede) throwError('Sede no encontrada.', 404);
    if (!sede.latitud || !sede.longitud) throwError('La sede no tiene coordenadas registradas.', 400);

    const garages = await obtenerGaragesCercanosConTiempoReal(
        parseFloat(sede.latitud),
        parseFloat(sede.longitud)
    );

    res.status(200).json(garages);
});

// CREATE (POST)
router.post('', requireRole(1, 4), async (req, res) => {
    const { id_sede, nombre, ubicacion, latitud, longitud, capacidad, estado, hora_apertura, hora_cierre, dias } = req.body;
    if (!isValidString(nombre)) throwError('El nombre es requerido.', 400);
    if (!isValidId(String(id_sede))) throwError('El id_sede es requerido y debe ser un número válido.', 400);
    if (!isValidPositiveNumber(capacidad)) throwError('La capacidad debe ser un número positivo.', 400);
    if (estado !== undefined && typeof estado !== 'boolean') throwError('El estado debe ser un valor booleano (true o false).', 400);
    if (hora_apertura !== undefined && hora_apertura !== null && !isValidTime(hora_apertura)) throwError('La hora de apertura debe tener formato HH:MM.', 400);
    if (hora_cierre !== undefined && hora_cierre !== null && !isValidTime(hora_cierre)) throwError('La hora de cierre debe tener formato HH:MM.', 400);
    if (hora_apertura && hora_cierre && hora_apertura >= hora_cierre) throwError('La hora de apertura debe ser anterior a la hora de cierre.', 400);
    if (!Array.isArray(dias) || dias.length === 0) throwError('Debe proporcionar al menos un dia disponible para el garage.', 400);
    for (const dia of dias) {
        if (!isValidDiaSemana(dia)) throwError(`El dia "${dia}" no es valido. Use: Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, Domingo.`, 400);
    }

    const data = await svc.createAsync(req.body);
    if (!data) throwError('Error interno al crear el garage.', 500);
    res.status(201).json(data);
});

// UPDATE (PUT)
router.put('/:id', requireRole(1, 4), async (req, res) => {
    if (!isValidId(req.params.id)) throwError('El ID proporcionado no es válido.', 400);
    const { id_sede, nombre, ubicacion, latitud, longitud, capacidad, estado, hora_apertura, hora_cierre, dias } = req.body;
    if (nombre !== undefined && !isValidString(nombre)) throwError('El nombre no puede estar vacío.', 400);
    if (id_sede !== undefined && !isValidId(String(id_sede))) throwError('El id_sede debe ser un número válido.', 400);
    if (capacidad !== undefined && !isValidPositiveNumber(capacidad)) throwError('La capacidad debe ser un número positivo.', 400);
    if (estado !== undefined && typeof estado !== 'boolean') throwError('El estado debe ser un valor booleano (true o false).', 400);
    if (hora_apertura !== undefined && hora_apertura !== null && !isValidTime(hora_apertura)) throwError('La hora de apertura debe tener formato HH:MM.', 400);
    if (hora_cierre !== undefined && hora_cierre !== null && !isValidTime(hora_cierre)) throwError('La hora de cierre debe tener formato HH:MM.', 400);
    if (hora_apertura && hora_cierre && hora_apertura >= hora_cierre) throwError('La hora de apertura debe ser anterior a la hora de cierre.', 400);
    if (dias !== undefined) {
        if (!Array.isArray(dias) || dias.length === 0) throwError('Debe proporcionar al menos un dia disponible para el garage.', 400);
        for (const dia of dias) {
            if (!isValidDiaSemana(dia)) throwError(`El dia "${dia}" no es valido. Use: Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, Domingo.`, 400);
        }
    }

    const data = await svc.updateAsync(parseInt(req.params.id, 10), req.body);
    if (!data) throwError('No encontrado: El garage con ese ID no existe.', 404);
    res.status(200).json(data);
});

// GET DIAS BY GARAGE ID
router.get('/:id/dias', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const data = await svc.getDiasAsync(id);
    if (!data) throwError('No encontrado.', 404);
    res.status(200).json({ id_garage: id, dias: data });
});

// POST ADD DIA TO GARAGE
router.post('/:id/dias', requireRole(1, 4), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const { dia } = req.body;
    if (!dia || !isValidDiaSemana(dia)) throwError(`El dia "${dia}" no es valido. Use: Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, Domingo.`, 400);

    const data = await svc.addDiaAsync(id, dia);
    if (!data) throwError('El dia ya estaba registrado o el garage no existe.', 400);
    res.status(201).json({ message: `Dia ${dia} agregado exitosamente.` });
});

// DELETE DIA FROM GARAGE
router.delete('/:id/dias/:dia', requireRole(1, 4), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throwError('El ID proporcionado no es válido.', 400);

    const { dia } = req.params;
    if (!isValidDiaSemana(dia)) throwError(`El dia "${dia}" no es valido. Use: Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, Domingo.`, 400);

    const ok = await svc.removeDiaAsync(id, dia);
    if (!ok) throwError('El dia no estaba registrado o el garage no existe.', 404);
    res.status(200).json({ message: `Dia ${dia} eliminado exitosamente.` });
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
