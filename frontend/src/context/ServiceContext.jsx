import { createContext, useEffect, useState, useContext } from "react"
import myAxios from "../services/myAxios"

const ServiceContext = createContext();

export const useService = () => useContext(ServiceContext);


export const ServiceProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [loadingService, setLoadingService] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await myAxios.get("core/get-all-services/");
        // фильтруем только активные этрапы
        // const activeEtraps = res.data.filter((e) => e.is_active !== false);
        setServices(res.data);
      } catch (err) {
        console.error("Ошибка загрузки uslug:", err);
      } finally {
        setLoadingService(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <ServiceContext.Provider value={{ services, loadingService }}>
      {children}
    </ServiceContext.Provider>
  );
};

