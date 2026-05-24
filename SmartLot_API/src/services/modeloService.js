// modeloService.js
import ModeloRepository from '../repositories/modeloRepository.js';
import MarcaRepository from '../repositories/marcaRepository.js';

export default class ModeloService {
    constructor() {
        console.log('Estoy en: ModeloService.constructor()');
        this.repo = new ModeloRepository();
        this.marcaRepo = new MarcaRepository();
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
     * Valida que las entidades relacionadas (marca) existan en la BD.
     * Lanza un error descriptivo si alguna no existe.
     */
    _validarRelacionesAsync = async (entity) => {
        if (entity.id_marca) {
            const marca = await this.marcaRepo.getByIdAsync(entity.id_marca);
            if (!marca) {
                const error = new Error(`La marca con ID ${entity.id_marca} no existe.`);
                error.statusCode = 400;
                throw error;
            }
        }
    }
}
