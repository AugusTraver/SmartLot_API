// garageService.js
import GarageRepository from '../repositories/garageRepository.js';
import SedeRepository from '../repositories/sedeRepository.js';

export default class GarageService {
    constructor() {
        console.log('Estoy en: GarageService.constructor()');
        this.repo = new GarageRepository();
        this.sedeRepo = new SedeRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);

    /**
     * Valida que las entidades relacionadas (sede) existan en la BD
     * y que las reglas de capacidad se cumplan.
     * Lanza un error descriptivo si alguna validación falla.
     */
    _validarRelacionesAsync = async (entity) => {
        // Validar que la sede exista
        if (entity.id_sede) {
            const sede = await this.sedeRepo.getByIdAsync(entity.id_sede);
            if (!sede) {
                const error = new Error(`La sede con ID ${entity.id_sede} no existe.`);
                error.statusCode = 400;
                throw error;
            }
        }

        // Validar reglas de capacidad
        if (entity.capacidad && entity.capacidad_reservas) {
            if (entity.capacidad_reservas > entity.capacidad) {
                const error = new Error('La capacidad de reservas no puede superar la capacidad total.');
                error.statusCode = 400;
                throw error;
            }
        }

        if (entity.capacidad && entity.capacidad_para_no_reservas) {
            if (entity.capacidad_para_no_reservas > entity.capacidad) {
                const error = new Error('La capacidad para no reservas no puede superar la capacidad total.');
                error.statusCode = 400;
                throw error;
            }
        }
    }

    createAsync = async (entity) => {
        await this._validarRelacionesAsync(entity);
        return await this.repo.createAsync(entity);
    }

    updateAsync = async (id, entity) => {
        await this._validarRelacionesAsync(entity);
        return await this.repo.updateAsync(id, entity);
    }

    deleteAsync = async (id) => await this.repo.deleteAsync(id);
    getOcupacionReservaAsync = async (id) => await this.repo.getOcupacionReservaAsync(id);
    getOcupacionNoReservaAsync = async (id) => await this.repo.getOcupacionNoReservaAsync(id);
}
