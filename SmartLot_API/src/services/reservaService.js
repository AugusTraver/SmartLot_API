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

    createAsync = async (entity) => {
        await this._validarRelacionesAsync(entity);
        this._validarFechasAsync(entity);
        return await this.repo.createAsync(entity);
    }

    updateAsync = async (id, entity) => {
        await this._validarRelacionesAsync(entity);
        this._validarFechasAsync(entity);
        return await this.repo.updateAsync(id, entity);
    }

    deleteAsync = async (id) => await this.repo.deleteAsync(id);
}
