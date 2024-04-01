import React, { createContext, useState } from 'react';

const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [contextData, setContextData] = useState({
    userInfo:{
      firstName:'',
      lastName:'',
      email:''
    },
    selectedOrganization:{
      id:"-1",
      name:'',
      address:'',
      city:'',
      state:'',
      zip:''
    }
  });

  const value = { contextData, setContextData };

  return (<DataContext.Provider value={value}>{children}</DataContext.Provider>);
};

export { DataContext, DataProvider };