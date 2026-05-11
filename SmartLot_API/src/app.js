import 'dotenv/config'
import express 	from "express";	// hacer npm i express
import cors 	from "cors";	// hacer npm i cors

// 
import EmpresaController   from "./controllers/empresaController.js"
import GarageController    from "./controllers/garageController.js"
import MarcaController     from "./controllers/marcaController.js"
import ModeloController    from "./controllers/modeloController.js"
import ReservaController   from "./controllers/reservaController.js"
import RolController       from "./controllers/rolController.js"
import SedeController      from "./controllers/sedeController.js"
import UsuarioController   from "./controllers/usuarioController.js"
import VehiculoController  from "./controllers/vehiculoController.js"

const app  = express();
const port = process.env.PORT || 3000;  // si no esta definido en el archivo .env uso el 3000.

// Agrego los Middlewares
app.use(cors());         // Middleware de CORS
app.use(express.json()); // Middleware para parsear y comprender JSON

// Endpoints (todos los Routers)
app.use("/api/empresa", EmpresaController);
app.use("/api/garage", GarageController);
app.use("/api/marca", MarcaController);
app.use("/api/modelo", ModeloController);
app.use("/api/reserva", ReservaController);
app.use("/api/rol", RolController);
app.use("/api/sede", SedeController);
app.use("/api/usuario", UsuarioController);
app.use("/api/vehiculo", VehiculoController);
//
// Inicio el Server y lo pongo a escuchar.
//
app.listen(port, () => {	// Inicio el servidor WEB (escuchar)
    console.log("server.js");
    console.log(`Listening on http://localhost:${port}`)
})
  