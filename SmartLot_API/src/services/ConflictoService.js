// conflictoService.js
import ConflictoRepository from '../repositories/ConflictoRepository.js';
import UsuarioService from './usuarioService.js';

export default class ConflictoService {
    constructor() {
        console.log('Estoy en: ConflictoService.constructor()');
        this.repo = new ConflictoRepository();
        this.usuarioService = new UsuarioService();
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

    _validarRelacionesAsync = async (entity) => {
        if (entity.id_usuario) {
            const usuario = await this.usuarioService.getByIdAsync(entity.id_usuario);
            if (!usuario) {
                const error = new Error(`El usuario con ID ${entity.id_usuario} no existe.`);
                error.statusCode = 400;
                throw error;
            }
        }
    }
}
