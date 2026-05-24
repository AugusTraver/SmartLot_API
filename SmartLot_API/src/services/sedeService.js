// sedeService.js
import SedeRepository from '../repositories/sedeRepository.js';
import EmpresaRepository from '../repositories/empresaRepository.js';

export default class SedeService {
    constructor() {
        console.log('Estoy en: SedeService.constructor()');
        this.repo = new SedeRepository();
        this.empresaRepo = new EmpresaRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);

    createAsync = async (entity) => {
        await this._validarRelacionesAsync(entity);
        return await this.repo.createAsync(entity);
    }

    updateAsync = async (id, entity) => {
        await this._validarRelacionesAsync(entity);
        return await this.repo.updateAsync(id, entity);
    }

    deleteAsync = async (id) => await this.repo.deleteAsync(id);

    /**
     * Valida que las entidades relacionadas (empresa) existan en la BD.
     * Lanza un error descriptivo si alguna no existe.
     */
    _validarRelacionesAsync = async (entity) => {
        if (entity.id_empresa) {
            const empresa = await this.empresaRepo.getByIdAsync(entity.id_empresa);
            if (!empresa) {
                const error = new Error(`La empresa con ID ${entity.id_empresa} no existe.`);
                error.statusCode = 400;
                throw error;
            }
        }
    }
}
