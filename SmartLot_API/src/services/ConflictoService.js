// conflictoService.js
import ConflictoRepository from '../repositories/ConflictoRepository.js';
import UsuarioService from './usuarioService.js';

export default class ConflictoService {
    constructor() {
        console.log('Estoy en: ConflictoService.constructor()');
        this.repo = new ConflictoRepository();
        this.usuarioService = new UsuarioService();
    }

    getAllAsync = async (superAdmin = false) => await this.repo.getAllAsync(superAdmin);

    getDeletedByUserAsync = async (deletedBy, superAdmin = false) =>
        await this.repo.getDeletedByUserAsync(deletedBy, superAdmin);

    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);

    createAsync = async (entity) => {
        await this._validarRelacionesAsync(entity);
        return await this.repo.createAsync(entity);
    }

    updateAsync = async (id, entity) => {
        await this._validarRelacionesAsync(entity);
        return await this.repo.updateAsync(id, entity);
    }

    deleteAsync = async (id, deletedBy = null) => await this.repo.deleteAsync(id, deletedBy);

    restoreAsync = async (id, deletedBy = null) => await this.repo.restoreAsync(id, deletedBy);

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
