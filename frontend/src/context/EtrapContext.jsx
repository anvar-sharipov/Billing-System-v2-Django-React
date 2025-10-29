// src/context/EtrapContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import myAxios from "../services/myAxios";

const EtrapContext = createContext();

export const useEtraps = () => useContext(EtrapContext);

export const EtrapProvider = ({ children }) => {
  const [etraps, setEtraps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEtraps = async () => {
      try {
        const res = await myAxios.get("core/etraps/");
        // фильтруем только активные этрапы
        const activeEtraps = res.data.filter((e) => e.is_active !== false);
        setEtraps(activeEtraps);
      } catch (err) {
        console.error("Ошибка загрузки этрапов:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEtraps();
  }, []);

  return (
    <EtrapContext.Provider value={{ etraps, loading }}>
      {children}
    </EtrapContext.Provider>
  );
};
