import { useEffect, useState } from "react";
import UsersHead from "./UsersHead";
import UsersTable from "./UsersTable";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import myAxios from "../../services/myAxios";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [etraps, setEtraps] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

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

      // sync pagination state from URL if present
      const pageParam = parseInt(params.get("page") || "1", 10) || 1;
      const pageSizeParam = parseInt(params.get("page_size") || "20", 10) || 20;
      setCurrentPage(pageParam);
      setPageSize(pageSizeParam);

      setLoading(true);
      try {
        const res = await myAxios.get(`core/get-filtered-users/?${params.toString()}`);
        console.log("API Response:", res.data.results);
        setUsers(res.data.results || []);
        // read pagination info if backend provided it
        if (res.data.pagination) {
          setTotalCount(res.data.pagination.total_count || 0);
          setTotalPages(res.data.pagination.total_pages || 0);
          // ensure current page & pageSize are in sync
          setCurrentPage(res.data.pagination.current_page || pageParam);
          setPageSize(res.data.pagination.page_size || pageSizeParam);
        } else {
          // fallback
          setTotalCount((res.data.results || []).length);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [location.search]);

  // Handlers for pagination changes — update URL params so fetch runs again
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(location.search);
    params.set("page", String(newPage));
    navigate(`?${params.toString()}`);
  };

  const handlePageSizeChange = (newSize) => {
    const params = new URLSearchParams(location.search);
    params.set("page_size", String(newSize));
    // when changing page size, reset to first page
    params.set("page", "1");
    navigate(`?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4 py-8">
        {/* container mx-auto px-4 py-8 */}
        <div>
          {/* className="max-w-7xl mx-auto" */}
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
          // pagination props
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;