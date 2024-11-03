import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";

interface ListaConectadosProps {
  connectionRef: any;
  setUsers: any;
}

const Login: React.FC<ListaConectadosProps> = ({ connectionRef, setUsers }) => {
  const [username, setUsername] = useState("");
  const [logueado, setLogueado] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`https://localhost:7281/login/${username}`);
      if (response.data !== "") {
        // Verificar si la conexión ya existe; si no, crear una nueva
        if (!connectionRef.current) {
          const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7281/authHub")
            .withAutomaticReconnect()
            .build();
  
          connection.on("UpdateUserList", (users) => {
            console.log(users);
            setUsers(Array.from(users));
          });
  
          await connection.start();
          console.log("Conectado a SignalR Hub");
          connectionRef.current = connection;
        }
  
        // Llamar a LoginUser en el servidor después de asegurar que la conexión esté activa
        await connectionRef.current.invoke("LoginUser", username);
        setLogueado(true);
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  const handleLogout = () => {
    if (connectionRef.current) {
      // Invocar un método en el servidor para eliminar el usuario antes de cerrar la conexión
      connectionRef.current
        .invoke("LogoutUser", username)
        .catch((err: any) => console.error("Error al cerrar sesión:", err))
        .finally(() => {
          // Detener la conexión después de informar al servidor
          connectionRef.current.stop().then(() => {
            connectionRef.current = null;
            setLogueado(false);
            setUsername("");
          });
        });
    } else {
      setLogueado(false);
      setUsername("");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {logueado ? (
        <>
          <h1>Bienvenido {username}</h1>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Ingrese su nombre"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleLogin}>Iniciar Sesión</button>
        </>
      )}
    </div>
  );
};

export default Login;
