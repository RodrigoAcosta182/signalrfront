import React from "react";

interface ListaConectadosProps {
  users: any;
}

const ListaConectados: React.FC<ListaConectadosProps> = ({ users }) => {
  return (
    <div>
      <h2>Usuarios Conectados</h2>
      <ul>
        {users?.map((user: any, index: number) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default ListaConectados;
