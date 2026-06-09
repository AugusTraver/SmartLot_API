// reservaService.js
import pool from '../database/db.js';
import ReservaRepository from '../repositories/reservaRepository.js';
import UsuarioService from './usuarioService.js';
import GarageService from './garageService.js';
import VehiculoService from './vehiculoService.js';
import SedeService from './sedeService.js';

export default class ReservaService {
    constructor() {
        console.log('Estoy en: ReservaService.constructor()');
        this.repo = new ReservaRepository();
        this.usuarioService = new UsuarioService();
        this.garageService = new GarageService();
        this.vehiculoService = new VehiculoService();
        this.sedeService = new SedeService();
    }

    getAllAsync = async () => await this.repo.getAllAsync();

    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);

    getActivasByUsuarioAsync = async (id_usuario) => await this.repo.getActivasByUsuarioAsync(id_usuario);

    getByUsuarioAsync = async (id_usuario) => await this.repo.getByUsuarioAsync(id_usuario);

    usuarioTieneReservasActivasAsync = async (id_usuario) => {
        const reservas = await this.repo.getActivasByUsuarioAsync(id_usuario);
        return reservas !== null && reservas.length > 0;
    }

    createAsync = async (entity, requestingUser) => {
        const rol = Number(requestingUser.id_rol);
        if (rol !== 1 && rol !== 4) {
            entity.id_usuario = requestingUser.id;
        }

        this._validarCamposObligatorios(entity);
        await this._validarRelacionesAsync(entity);
        this._validarFechasAsync(entity);
        await this._validarDisponibilidadAsync(entity);

        entity.entro = false;
        entity.salio = false;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const reserva = await this.repo.createWithClientAsync(entity, client);
            if (!reserva) {
                const error = new Error('Error interno al crear la reserva.');
                error.statusCode = 500;
                throw error;
            }

            const garage = await this.garageService.incrementOcupacionReservasWithClientAsync(entity.id_garage, client);
            if (!garage) {
                const error = new Error(`El garage con ID ${entity.id_garage} no tiene capacidad disponible para esta reserva.`);
                error.statusCode = 400;
                throw error;
            }

            await client.query('COMMIT');
            return reserva;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    updateAsync = async (id, entity, requestingUser) => {
        const rol = Number(requestingUser.id_rol);
        if (rol !== 1 && rol !== 4) {
            delete entity.id_usuario;
        }

        const current = await this.repo.getByIdAsync(id);
        if (!current) {
            const error = new Error(`La reserva con ID ${id} no existe.`);
            error.statusCode = 404;
            throw error;
        }

        if (Object.keys(entity).length === 0) {
            const error = new Error('Debe enviar al menos un campo para actualizar la reserva.');
            error.statusCode = 400;
            throw error;
        }

        if (current.salio) {
            const error = new Error(`La reserva con ID ${id} ya fue finalizada y no puede modificarse.`);
            error.statusCode = 400;
            throw error;
        }

        if (current.entro) {
            const error = new Error(`La reserva con ID ${id} ya registro su ingreso y no puede modificarse.`);
            error.statusCode = 400;
            throw error;
        }

        const ahora = new Date();
        const fechaEntradaActual = new Date(current.fecha_entrada);
        const limiteModificacion = new Date(fechaEntradaActual.getTime() - 30 * 60 * 1000);
        if (ahora >= limiteModificacion) {
            const error = new Error(`La reserva con ID ${id} esta demasiado proxima a su inicio para ser modificada.`);
            error.statusCode = 400;
            throw error;
        }

        const mergedEntity = { ...current, ...entity };

        this._validarCamposObligatorios(mergedEntity);
        await this._validarRelacionesAsync(mergedEntity);
        this._validarFechasAsync(mergedEntity);
        await this._validarDisponibilidadAsync(mergedEntity, id);

        return await this.repo.updateAsync(id, mergedEntity);
    }

    deleteAsync = async (id) => await this.cancelarAsync(id);

    cancelarAsync = async (id) => {
        const reserva = await this.repo.getByIdAsync(id);
        if (!reserva) {
            const error = new Error(`La reserva con ID ${id} no existe.`);
            error.statusCode = 404;
            throw error;
        }

        if (reserva.entro && !reserva.salio) {
            const error = new Error(`La reserva con ID ${id} ya registro su ingreso. Debe registrar la salida antes de cancelarla.`);
            error.statusCode = 400;
            throw error;
        }

        const ahora = new Date();
        const fechaEntrada = new Date(reserva.fecha_entrada);
        const limiteCancelacion = new Date(fechaEntrada.getTime() - 30 * 60 * 1000);
        if (ahora >= limiteCancelacion) {
            const error = new Error(`La reserva con ID ${id} esta demasiado proxima a su inicio para ser cancelada.`);
            error.statusCode = 400;
            throw error;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const cancelada = await this.repo.cancelarWithClientAsync(id, client);
            if (!cancelada) {
                const error = new Error(`Error interno al cancelar la reserva con ID ${id}.`);
                error.statusCode = 500;
                throw error;
            }

            if (!reserva.salio) {
                const updatedGarage = await this.garageService.decrementOcupacionReservasWithClientAsync(reserva.id_garage, client);
                if (!updatedGarage) {
                    const error = new Error(`Error al liberar la ocupacion del garage con ID ${reserva.id_garage}.`);
                    error.statusCode = 500;
                    throw error;
                }
            }

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    checkInAsync = async (id) => {
        const reserva = await this.repo.getByIdAsync(id);
        if (!reserva) {
            const error = new Error(`La reserva con ID ${id} no existe.`);
            error.statusCode = 404;
            throw error;
        }

        if (reserva.entro) {
            const error = new Error(`La reserva con ID ${id} ya registro su ingreso.`);
            error.statusCode = 400;
            throw error;
        }

        if (reserva.salio) {
            const error = new Error(`La reserva con ID ${id} ya registro su salida.`);
            error.statusCode = 400;
            throw error;
        }

        const ahora = new Date();
        const fechaEntrada = new Date(reserva.fecha_entrada);
        const ingresoPermitidoDesde = new Date(fechaEntrada.getTime() - 60 * 60 * 1000);

        if (ahora < ingresoPermitidoDesde) {
            const error = new Error(`La reserva con ID ${id} todavia no esta habilitada para registrar ingreso.`);
            error.statusCode = 400;
            throw error;
        }

        if (ahora > new Date(reserva.fecha_salida)) {
            const error = new Error(`La reserva con ID ${id} ya supero su horario de salida previsto.`);
            error.statusCode = 400;
            throw error;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const garage = await this.garageService.getByIdForUpdateWithClientAsync(reserva.id_garage, client);
            if (!garage) {
                const error = new Error(`El garage con ID ${reserva.id_garage} no existe.`);
                error.statusCode = 400;
                throw error;
            }

            this._validarGarageDisponible(garage);
            this._validarCapacidadTotalActualGarage(garage);

            const updatedReserva = await this.repo.registrarIngresoWithClientAsync(id, client);
            if (!updatedReserva) {
                const error = new Error('Error al registrar el ingreso de la reserva.');
                error.statusCode = 500;
                throw error;
            }

            await client.query('COMMIT');
            return updatedReserva;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    checkOutAsync = async (id) => {
        const reserva = await this.repo.getByIdAsync(id);
        if (!reserva) {
            const error = new Error(`La reserva con ID ${id} no existe.`);
            error.statusCode = 404;
            throw error;
        }

        if (!reserva.entro) {
            const error = new Error(`La reserva con ID ${id} no puede registrar salida sin haber registrado su ingreso.`);
            error.statusCode = 400;
            throw error;
        }

        if (reserva.salio) {
            const error = new Error(`La reserva con ID ${id} ya registro su salida.`);
            error.statusCode = 400;
            throw error;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const garage = await this.garageService.getByIdForUpdateWithClientAsync(reserva.id_garage, client);
            if (!garage) {
                const error = new Error(`El garage con ID ${reserva.id_garage} no existe.`);
                error.statusCode = 400;
                throw error;
            }

            const updatedReserva = await this.repo.registrarSalidaWithClientAsync(id, client);
            if (!updatedReserva) {
                const error = new Error('Error al registrar la salida de la reserva.');
                error.statusCode = 500;
                throw error;
            }

            const updatedGarage = await this.garageService.decrementOcupacionReservasWithClientAsync(reserva.id_garage, client);
            if (!updatedGarage) {
                const error = new Error(`La ocupacion de reservas del garage con ID ${reserva.id_garage} ya esta en cero.`);
                error.statusCode = 400;
                throw error;
            }

            await client.query('COMMIT');
            return updatedReserva;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    _validarCamposObligatorios = (entity) => {
        const errores = [];

        if (!entity.id_usuario) errores.push('El id_usuario es requerido.');
        if (!entity.id_garage) errores.push('El id_garage es requerido.');
        if (!entity.id_vehiculo) errores.push('El id_vehiculo es requerido.');
        if (!entity.fecha_entrada) errores.push('La fecha de entrada es requerida.');
        if (!entity.fecha_salida) errores.push('La fecha de salida es requerida.');

        if (errores.length > 0) {
            const error = new Error(errores.join(' '));
            error.statusCode = 400;
            throw error;
        }
    }

    _validarRelacionesAsync = async (entity) => {
        const errores = [];
        let usuario = null;
        let garage = null;
        let vehiculo = null;

        if (entity.id_usuario) {
            usuario = await this.usuarioService.getByIdAsync(entity.id_usuario);
            if (!usuario) {
                errores.push(`El usuario con ID ${entity.id_usuario} no existe.`);
            } else if (usuario.activo === false) {
                errores.push(`El usuario con ID ${entity.id_usuario} esta inactivo.`);
            }
        }

        if (entity.id_garage) {
            garage = await this.garageService.getByIdAsync(entity.id_garage);
            if (!garage) {
                errores.push(`El garage con ID ${entity.id_garage} no existe.`);
            } else {
                try {
                    this._validarGarageDisponible(garage);
                } catch (error) {
                    errores.push(error.message);
                }
            }
        }

        if (entity.id_vehiculo) {
            vehiculo = await this.vehiculoService.getByIdAsync(entity.id_vehiculo);
            if (!vehiculo) {
                errores.push(`El vehiculo con ID ${entity.id_vehiculo} no existe.`);
            } else if (usuario && vehiculo.id_usuario !== usuario.id) {
                errores.push(`El vehiculo con ID ${entity.id_vehiculo} no pertenece al usuario con ID ${entity.id_usuario}.`);
            }
        }

        if (usuario && usuario.id_empresa && garage && garage.id_sede) {
            const sede = await this.sedeService.getByIdAsync(garage.id_sede);
            if (sede && Number(sede.id_empresa) !== Number(usuario.id_empresa)) {
                errores.push(`El garage con ID ${entity.id_garage} no pertenece a la misma empresa que el usuario.`);
            }
        }

        if (errores.length > 0) {
            const error = new Error(errores.join(' '));
            error.statusCode = 400;
            throw error;
        }
    }

    _validarFechasAsync = (entity) => {
        const fechaEntrada = new Date(entity.fecha_entrada);
        const fechaSalida = new Date(entity.fecha_salida);

        if (isNaN(fechaEntrada.getTime())) {
            const error = new Error('La fecha de entrada debe ser una fecha valida.');
            error.statusCode = 400;
            throw error;
        }

        if (isNaN(fechaSalida.getTime())) {
            const error = new Error('La fecha de salida debe ser una fecha valida.');
            error.statusCode = 400;
            throw error;
        }

        if (fechaEntrada < new Date()) {
            const error = new Error('La fecha de entrada no puede ser en el pasado.');
            error.statusCode = 400;
            throw error;
        }

        if (fechaSalida <= fechaEntrada) {
            const error = new Error('La fecha de salida debe ser posterior a la fecha de entrada.');
            error.statusCode = 400;
            throw error;
        }

        const DURACION_MAXIMA_MS = 12 * 60 * 60 * 1000;
        if (fechaSalida - fechaEntrada > DURACION_MAXIMA_MS) {
            const error = new Error('La reserva no puede superar las 12 horas de duracion.');
            error.statusCode = 400;
            throw error;
        }

        const ANTELACION_MINIMA_MS = 30 * 60 * 1000;
        if (fechaEntrada.getTime() - Date.now() < ANTELACION_MINIMA_MS) {
            const error = new Error('La reserva debe hacerse con al menos 30 minutos de antelacion.');
            error.statusCode = 400;
            throw error;
        }
    }

    _validarDisponibilidadAsync = async (entity, excludeId = null) => {
        const activas = await this.repo.getActivasByUsuarioAsync(entity.id_usuario);
        const countActivas = activas ? (excludeId ? activas.filter(r => Number(r.id) !== Number(excludeId)).length : activas.length) : 0;
        if (countActivas > 0) {
            const error = new Error(`El usuario con ID ${entity.id_usuario} ya tiene una reserva activa.`);
            error.statusCode = 400;
            throw error;
        }

        const overlapUsuario = await this.repo.getOverlapByUsuarioAsync(
            entity.id_usuario,
            entity.fecha_entrada,
            entity.fecha_salida,
            excludeId
        );
        if (overlapUsuario && overlapUsuario.length > 0) {
            const error = new Error(`El usuario con ID ${entity.id_usuario} ya tiene una reserva activa durante este periodo.`);
            error.statusCode = 400;
            throw error;
        }

        const overlapVehiculo = await this.repo.getOverlapByVehiculoAsync(
            entity.id_vehiculo,
            entity.fecha_entrada,
            entity.fecha_salida,
            excludeId
        );
        if (overlapVehiculo && overlapVehiculo.length > 0) {
            const error = new Error(`El vehiculo con ID ${entity.id_vehiculo} ya tiene una reserva activa durante este periodo.`);
            error.statusCode = 400;
            throw error;
        }

        const garage = await this.garageService.getByIdAsync(entity.id_garage);
        if (!garage) {
            const error = new Error(`El garage con ID ${entity.id_garage} no existe.`);
            error.statusCode = 400;
            throw error;
        }

        this._validarGarageDisponible(garage);

        if (garage.hora_apertura && garage.hora_cierre) {
            const fechaEntrada = new Date(entity.fecha_entrada);
            const fechaSalida = new Date(entity.fecha_salida);

            const entradaMinutos = fechaEntrada.getHours() * 60 + fechaEntrada.getMinutes();
            const salidaMinutos = fechaSalida.getHours() * 60 + fechaSalida.getMinutes();

            const aperturaParts = garage.hora_apertura.split(':');
            const cierreParts = garage.hora_cierre.split(':');

            const aperturaMinutos = parseInt(aperturaParts[0], 10) * 60 + parseInt(aperturaParts[1], 10);
            const cierreMinutos = parseInt(cierreParts[0], 10) * 60 + parseInt(cierreParts[1], 10);

            if (entradaMinutos < aperturaMinutos) {
                const error = new Error(`El garage con ID ${entity.id_garage} abre a las ${garage.hora_apertura}.`);
                error.statusCode = 400;
                throw error;
            }

            if (salidaMinutos > cierreMinutos) {
                const error = new Error(`El garage con ID ${entity.id_garage} cierra a las ${garage.hora_cierre}.`);
                error.statusCode = 400;
                throw error;
            }
        }

        const capReservas = garage.capacidad_reservas !== null && garage.capacidad_reservas !== undefined
            ? garage.capacidad_reservas
            : (garage.capacidad || 0);

        if (capReservas <= 0) {
            const error = new Error(`El garage con ID ${entity.id_garage} no tiene capacidad disponible para reservas.`);
            error.statusCode = 400;
            throw error;
        }

        const overlapGarage = await this.repo.getOverlapByGarageAsync(
            entity.id_garage,
            entity.fecha_entrada,
            entity.fecha_salida,
            excludeId
        );

        const events = [
            { time: new Date(entity.fecha_entrada), type: 1 },
            { time: new Date(entity.fecha_salida), type: -1 }
        ];

        for (const reserva of overlapGarage || []) {
            events.push({ time: new Date(reserva.fecha_entrada), type: 1 });
            events.push({ time: new Date(reserva.fecha_salida), type: -1 });
        }

        events.sort((a, b) => {
            const diff = a.time.getTime() - b.time.getTime();
            if (diff !== 0) return diff;
            return a.type - b.type;
        });

        let current = 0;
        let max = 0;
        for (const event of events) {
            current += event.type;
            if (current > max) max = current;
        }

        if (max > capReservas) {
            const error = new Error(`El garage con ID ${entity.id_garage} supera su capacidad maxima de reservas (${capReservas}) durante el periodo solicitado.`);
            error.statusCode = 400;
            throw error;
        }
    }

    _validarGarageDisponible = (garage) => {
        if (garage.estado === false) {
            const error = new Error(`El garage con ID ${garage.id} no esta disponible.`);
            error.statusCode = 400;
            throw error;
        }

        if (!garage.capacidad || garage.capacidad <= 0) {
            const error = new Error(`El garage con ID ${garage.id} no tiene capacidad configurada.`);
            error.statusCode = 400;
            throw error;
        }
    }

    _validarCapacidadTotalActualGarage = (garage) => {
        const totalCap = garage.capacidad || 0;
        const currentNoRes = garage.ocupacion_no_reservas || 0;
        const currentRes = garage.ocupacion_reservas || 0;

        if (currentNoRes + currentRes >= totalCap) {
            const error = new Error(`El garage con ID ${garage.id} esta completamente lleno.`);
            error.statusCode = 400;
            throw error;
        }
    }

    _validarCapacidadReservasActualGarage = (garage) => {
        const capReservas = garage.capacidad_reservas !== null && garage.capacidad_reservas !== undefined
            ? garage.capacidad_reservas
            : (garage.capacidad || 0);
        const currentRes = garage.ocupacion_reservas || 0;

        if (currentRes >= capReservas) {
            const error = new Error(`El garage con ID ${garage.id} no tiene lugares disponibles para reservas.`);
            error.statusCode = 400;
            throw error;
        }
    }
}
