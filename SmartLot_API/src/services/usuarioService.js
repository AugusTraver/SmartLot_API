// usuarioService.js
import UsuarioRepository from '../repositories/usuarioRepository.js';

export default class UsuarioService {
   constructor() {
        console.log('Estoy en: usuarioService.constructor()');
        this.UsuarioRepository = new UsuarioRepository();
    }

    getAllAsync = async () => {
        console.log(`UsuarioService.getAllAsync()`);
        const returnArray = await this.UsuarioRepository.getAllAsync();
        if (returnArray == null) return null;
       
    }
}