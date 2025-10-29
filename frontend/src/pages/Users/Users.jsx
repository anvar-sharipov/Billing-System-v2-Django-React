import { useEffect, useState } from "react";
import UsersHead from "./UsersHead";
import UsersTable from "./UsersTable";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import myAxios from "../../services/myAxios";

const Users = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [etraps, setEtraps] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());

  useEffect(() => {
    document.title = t("Users");
  }, [t]);

  // Загрузка этрапов
  useEffect(() => {
    const fetchEtraps = async () => {
      try {
        const res = await myAxios.get("core/etraps/");
        setEtraps(res.data);
      } catch (error) {
        console.error("Error fetching etraps:", error);
      }
    };
    fetchEtraps();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const params = new URLSearchParams(location.search);

      if (!params.toString()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const res = await myAxios.get(`core/get-filtered-users/?${params.toString()}`);
        console.log("API Response:", res.data.results);
        setUsers(res.data.results || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Шапка страницы */}
          <UsersHead 
            selectedRows={selectedRows}
            totalRows={users.length}
            etraps={etraps}
          />

          <div className="bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-800/50 dark:to-gray-700/30 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10 dark:border-gray-600/30 mt-6">
            <UsersTable 
              users={users} 
              loading={loading}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;