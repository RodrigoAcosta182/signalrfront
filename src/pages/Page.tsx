import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useParams } from "react-router";
import "./Page.css";
import Login from "./Login/Login";
import ListaConectados from "./ListaConectados/ListaConectados";
import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

const Page: React.FC = () => {
  const [users, setUsers] = useState([]);
  const { name } = useParams<{ name: string }>();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    // Crear la conexión y guardarla en useRef solo si no existe
    const createConnection = () => {
      if (!connectionRef.current) {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl("https://localhost:7281/authHub")
          .withAutomaticReconnect()
          .build();
        connection
          .start()
          .then(() => {
            console.log("Conectado a SignalR Hub");
            connectionRef.current = connection; // Guardar la conexión después de iniciar correctamente
            // Llamar a GetConnectedUsers para obtener la lista inicial de usuarios
            connection
              .invoke("GetConnectedUsers")
              .catch((err) =>
                console.error("Error al obtener usuarios conectados:", err)
              );
          })
          .catch((err) => console.log("Error de conexión:", err));
        //actualiza lista de usuarios conectados
        connection.on("UpdateUserList", (users) => {
          setUsers(Array.from(users));
        });
      }
    };
    createConnection();
    // Detener la conexión al desmontar el componente
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().then(() => {
          connectionRef.current = null;
        });
      }
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {name === "Login" ? (
          <Login setUsers={setUsers} connectionRef={connectionRef} />
        ) : (
          <ListaConectados users={users} />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Page;
