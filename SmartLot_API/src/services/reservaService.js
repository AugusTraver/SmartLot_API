// reservaService.js
import ReservaRepository from '../repositories/reservaRepository.js';
import UsuarioRepository from '../repositories/usuarioRepository.js';
import GarageRepository from '../repositories/garageRepository.js';
import VehiculoRepository from '../repositories/vehiculoRepository.js';

export default class ReservaService {
    constructor() {
        console.log('Estoy en: ReservaService.constructor()');
        this.repo = new ReservaRepository();
        this.usuarioRepo = new UsuarioRepository();
        this.garageRepo = new GarageRepository();
        this.vehiculoRepo = new VehiculoRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);

    /**
     * Valida que las entidades relacionadas (usuario, garage, vehiculo) existan en la BD.
     * Recopila todos los errores y los lanza juntos.
     */
    _validarRelacionesAsync = async (entity) => {
        const errores = [];

        // Validar que el usuario exista
        if (entity.id_usuario) {
            const usuario = await this.usuarioRepo.getByIdAsync(entity.id_usuario);
            if (!usuario) {
                errores.push(`El usuario con ID ${entity.id_usuario} no existe.`);
            }
        }

        // Validar que el garage exista
        if (entity.id_garage) {
            const garage = await this.garageRepo.getByIdAsync(entity.id_garage);
            if (!garage) {
                errores.push(`El garage con ID ${entity.id_garage} no existe.`);
            }
        }

        // Validar que el vehículo exista
        if (entity.id_vehiculo) {
            const vehiculo = await this.vehiculoRepo.getByIdAsync(entity.id_vehiculo);
            if (!vehiculo) {
                errores.push(`El vehículo con ID ${entity.id_vehiculo} no existe.`);
            }
        }

        if (errores.length > 0) {
            const error = new Error(errores.join(' '));
            error.statusCode = 400;
            throw error;
        }
    }

    /**
     * Valida las reglas de negocio de fechas.
     * Lanza un error descriptivo si alguna validación falla.
     */
    _validarFechasAsync = (entity) => {
        // Validar que la fecha de entrada no sea en el pasado
        if (entity.fecha_entrada) {
            if (new Date(entity.fecha_entrada) < new Date()) {
                const error = new Error('La fecha de entrada no puede ser en el pasado.');
                error.statusCode = 400;
                throw error;
            }
        }

        // Validar que la fecha de salida sea posterior a la fecha de entrada
        if (entity.fecha_entrada && entity.fecha_salida) {
            if (new Date(entity.fecha_salida) <= new Date(entity.fecha_entrada)) {
                const error = new Error('La fecha de salida debe ser posterior a la fecha de entrada.');
                error.statusCode = 400;
                throw error;
            }
        }
    }

    /**
     * Valida la disponibilidad del vehículo y la capacidad de reservas del garage.
     * Lanza un error si hay solapamiento de vehículo o si se supera la capacidad máxima.
     */
    _validarDisponibilidadAsync = async (entity, excludeId = null) => {
        // 1. Validar solapamiento del vehículo
        if (entity.id_vehiculo && entity.fecha_entrada && entity.fecha_salida) {
            const overlapVehiculo = await this.repo.getOverlapByVehiculoAsync(
                entity.id_vehiculo,
                entity.fecha_entrada,
                entity.fecha_salida,
                excludeId
            );
            if (overlapVehiculo && overlapVehiculo.length > 0) {
                const error = new Error(`El vehículo con ID ${entity.id_vehiculo} ya tiene una reserva activa durante este período.`);
                error.statusCode = 400;
                throw error;
            }
        }

        // 2. Validar capacidad máxima de reservas del garage
        if (entity.id_garage && entity.fecha_entrada && entity.fecha_salida) {
            const garage = await this.garageRepo.getByIdAsync(entity.id_garage);
            if (!garage) {
                const error = new Error(`El garage con ID ${entity.id_garage} no existe.`);
                error.statusCode = 400;
                throw error;
            }

            const capReservas = garage.capacidad_reservas !== null && garage.capacidad_reservas !== undefined 
                ? garage.capacidad_reservas 
                : (garage.capacidad || 0);

            const overlapGarage = await this.repo.getOverlapByGarageAsync(
                entity.id_garage,
                entity.fecha_entrada,
                entity.fecha_salida,
                excludeId
            );

            if (overlapGarage) {
                const events = [];
                // reserva propuesta
                events.push({ time: new Date(entity.fecha_entrada), type: 1 });
                events.push({ time: new Date(entity.fecha_salida), type: -1 });

                // reservas existentes solapadas
                for (const r of overlapGarage) {
                    events.push({ time: new Date(r.fecha_entrada), type: 1 });
                    events.push({ time: new Date(r.fecha_salida), type: -1 });
                }

                // Ordenar: primero por tiempo, luego salidas (-1) antes de entradas (1)
                events.sort((a, b) => {
                    const diff = a.time.getTime() - b.time.getTime();
                    if (diff !== 0) return diff;
                    return a.type - b.type;
                });

                let current = 0;
                let max = 0;
                for (const event of events) {
                    current += event.type;
                    if (current > max) {
                        max = current;
                    }
                }

                if (max > capReservas) {
                    const error = new Error(`El garage con ID ${entity.id_garage} supera su capacidad máxima de reservas (${capReservas}) durante el período solicitado.`);
                    error.statusCode = 400;
                    throw error;
                }
            }
        }
    }

    createAsync = async (entity) => {
        await this._validarRelacionesAsync(entity);
        this._validarFechasAsync(entity);
        await this._validarDisponibilidadAsync(entity);
        return await this.repo.createAsync(entity);
    }

    updateAsync = async (id, entity) => {
        const current = await this.repo.getByIdAsync(id);
        if (!current) return null;

        const mergedEntity = { ...current, ...entity };

        await this._validarRelacionesAsync(mergedEntity);
        this._validarFechasAsync(mergedEntity);
        await this._validarDisponibilidadAsync(mergedEntity, id);

        return await this.repo.updateAsync(id, mergedEntity);
    }

    deleteAsync = async (id) => await this.repo.deleteAsync(id);

    checkInAsync = async (id) => {
        const reserva = await this.repo.getByIdAsync(id);
        if (!reserva) {
            const error = new Error(`La reserva con ID ${id} no existe.`);
            error.statusCode = 404;
            throw error;
        }

        if (reserva.entro) {
            const error = new Error(`La reserva con ID ${id} ya registró su ingreso.`);
            error.statusCode = 400;
            throw error;
        }

        if (reserva.salio) {
            const error = new Error(`La reserva con ID ${id} ya registró su salida.`);
            error.statusCode = 400;
            throw error;
        }

        // Marcar ingreso
        reserva.entro = new Date();
        const updatedReserva = await this.repo.updateAsync(id, reserva);

        // Incrementar ocupación en el garage
        if (updatedReserva) {
            await this.garageRepo.incrementOcupacionReservasAsync(reserva.id_garage);
        }

        return updatedReserva;
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
            const error = new Error(`La reserva con ID ${id} ya registró su salida.`);
            error.statusCode = 400;
            throw error;
        }

        // Marcar salida
        reserva.salio = new Date();
        const updatedReserva = await this.repo.updateAsync(id, reserva);

        // Decrementar ocupación en el garage
        if (updatedReserva) {
            await this.garageRepo.decrementOcupacionReservasAsync(reserva.id_garage);
        }

        return updatedReserva;
    }
}
