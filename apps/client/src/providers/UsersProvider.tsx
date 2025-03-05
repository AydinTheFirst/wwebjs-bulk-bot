/* eslint-disable react-refresh/only-export-components */
import React, { useEffect } from "react";

import { User } from "@/types";

export type UsersContextType = {
  selectedUsers: User[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  users: User[];
};

export const UsersContext = React.createContext<undefined | UsersContextType>(
  undefined,
);

export const useUsers = () => {
  const context = React.useContext(UsersContext);

  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }

  return context;
};

export const UsersProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);

  useEffect(() => {
    if (users.length === 0) return;
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const users = localStorage.getItem("users");
    if (!users) return;
    setUsers(JSON.parse(users));
  }, []);

  return (
    <UsersContext.Provider
      value={{ selectedUsers, setSelectedUsers, setUsers, users }}
    >
      {children}
    </UsersContext.Provider>
  );
};
