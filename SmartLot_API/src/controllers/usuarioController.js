// usuarioController.js
import { Router } from 'express';
import UsuarioService from './../services/usuarioService.js';
import Usuario from './../entities/usuario.js';

const router = Router();
const currentService = new UsuarioService();

router.get('', async (req, res) => {
        try {
            console.log(`UsuarioController.get`);
            const returnArray = await currentService.getAllAsync();
            if (returnArray != null){
                res.status(StatusCodes.OK).json(returnArray);
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error interno.`);
            }
        } catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
        }
    });

export default router;