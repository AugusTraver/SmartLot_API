// usuarioService.js
import UsuarioRepository from '../repositories/usuarioRepository.js';

export default class UsuarioService {
    constructor() {
        console.log('Estoy en: UsuarioService.constructor()');
        this.repo = new UsuarioRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);
    createAsync = async (entity) => await this.repo.createAsync(entity);
    updateAsync = async (id, entity) => await this.repo.updateAsync(id, entity);
    deleteAsync = async (id) => await this.repo.deleteAsync(id);
}
