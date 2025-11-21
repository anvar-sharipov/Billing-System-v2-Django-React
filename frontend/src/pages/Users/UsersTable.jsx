import { useMemo, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Eye, EyeOff, Download, Edit, MoreVertical, ArrowUpCircle, ArrowDownCircle, ArrowUp, ArrowDown, Plus, Info, Coins, List } from "lucide-react";
import { createPortal } from "react-dom";
import myAxios from "../../services/myAxios";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";
import MyModal from "../UI/MyModal";
import { DataDisplay, ChangesDisplay } from "./DisplayHistoryFunctions";

const UsersTable = ({
  users,
  loading,
  selectedRows,
  setSelectedRows,
  currentPage = 1,
  pageSize = 20,
  totalCount = 0,
  totalPages = 0,
  onPageChange,
  onPageSizeChange,
  onSortChange, // новый проп для сортировки
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [infoModal, setInfoModal] = useState({ status: false, user: null });
  const [userInfo, setUserInfo] = useState({});

  const [userHistory, setUserHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!infoModal.status) return;

    const getUserInfo = async () => {
      setLoadingHistory(true);
      try {
        const res = await myAxios.get("core/get-user-history/", {
          params: { user_id: infoModal.user },
        });
        console.log("res", res.data);
        setUserHistory(res.data.history || []);
      } catch (err) {
        console.log("cant get user info = ", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    getUserInfo();
  }, [infoModal.status, infoModal.user]);

  // Состояние сортировки
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc", // 'asc' или 'desc'
  });

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowColumnSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Загружаем настройки колонок из localStorage
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("usersTableColumns");
    return saved
      ? JSON.parse(saved)
      : {
          checkbox: true,
          actions: true,
          contracts: true,
          fullName: true,
          login: true,
          phone: true,
          number: true,
          type: true,
          hbType: true,
          account: true,
          etrap: true,
          address: true,
          id: true,
          comment: true,
          abonplata: true,
          services: true,
        };
  });

  // Сохраняем настройки колонок в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("usersTableColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Обработчик сортировки
  const handleSort = (columnKey) => {
    let direction = "asc";

    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === columnKey && sortConfig.direction === "desc") {
      // Сбрасываем сортировку при третьем клике
      setSortConfig({ key: null, direction: "asc" });
      if (onSortChange) {
        onSortChange(null, null);
      }
      return;
    }

    const newSortConfig = { key: columnKey, direction };
    setSortConfig(newSortConfig);

    if (onSortChange) {
      onSortChange(columnKey, direction);
    }
  };

  // Функция для получения иконки сортировки
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <div className="w-4 h-4 opacity-30">
          <ArrowUp size={14} />
        </div>
      );
    }

    return sortConfig.direction === "asc" ? <ArrowUp size={14} className="text-blue-500" /> : <ArrowDown size={14} className="text-blue-500" />;
  };

  // Определяем колонки с поддержкой сортировки
  const columns = useMemo(
    () => [
      {
        key: "checkbox",
        label: "",
        width: "w-12",
        sortable: false,
        render: (user) => (
          <input
            type="checkbox"
            checked={selectedRows.has(user.id)}
            onChange={(e) => {
              const newSelected = new Set(selectedRows);
              if (e.target.checked) {
                newSelected.add(user.id);
              } else {
                newSelected.delete(user.id);
              }
              setSelectedRows(newSelected);
            }}
            className="rounded border-gray-400 text-blue-500 focus:ring-blue-500"
          />
        ),
      },
      {
        key: "actions",
        label: "",
        width: "w-16",
        sortable: false,
        render: (user) => (
          <div className="grid grid-cols-2 gap-1 w-16">
            <button
              className="group p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md border border-blue-200/50 dark:border-blue-700/30"
              title={t("Add new dogowor")}
              onClick={() => navigate(`/users/${user.id}/dogowor/new`)}
            >
              <Plus size={14} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>
            <button
              className="group p-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/30 dark:hover:bg-gray-700/40 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md border border-gray-200/50 dark:border-gray-700/30"
              title={t("show history")}
              onClick={() => setInfoModal({ status: true, user: user.id })}
            >
              <Info size={14} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
            <button
              className="group p-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md border border-amber-200/50 dark:border-amber-700/30"
              title={t("pay_it")}
            >
              <Coins size={14} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
            <button
              className="group p-2 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md border border-green-200/50 dark:border-green-700/30"
              title={t("cash")}
              onClick={() => navigate(`/user-cash/${user.id}`)}
            >
              <List size={14} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        ),
      },
      {
        key: "contracts",
        label: t("contractsBalance"),
        width: "w-80",
        sortable: false, // сложная колонка, не сортируем
        render: (user) => (
          <div className="space-y-2">
            {user.dogowors?.map((dogowor, index) => (
              <div key={index} className={`space-y-1 p-2 rounded-lg bg-gray-100 dark:bg-white/5`}>
                <div className="flex gap-2 items-center">
                  <div className="flex justify-between items-start gap-2">
                    <div
                      className={`font-mono text-sm px-3 py-1 rounded-lg transition-colors flex items-center gap-2
                      bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:ring-yellow-400/10 shadow-sm`}
                      title={t("Edit user")}
                    >
                      <Edit
                        size={14}
                        onClick={() => {
                          if (dogowor.balance_type2 == "telefon") {
                            navigate(ROUTES.ABONENT_FORM, { state: { dogoworId: dogowor.id } });
                          }
                        }}
                        className={`${dogowor.deactivate_at ? "text-red-500 animate-pulse" : "text-green-500 animate-pulse"}`}
                      />
                      <div className="flex items-center gap-3">
                        <span>{dogowor.dogowor}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${parseFloat(dogowor.balance) < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    ({dogowor.balance < 0 ? "" : "+"}
                    {parseFloat(dogowor.balance).toFixed(4)})
                  </div>
                </div>

                {dogowor.activate_at && (
                  <div className={`text-xs text-gray-600 dark:text-white/50`}>
                    {t("activated")}: {new Date(dogowor.activate_at).toLocaleDateString()}
                  </div>
                )}
                {dogowor.deactivate_at && (
                  <div className={`text-xs text-gray-600 dark:text-white/50`}>
                    {t("deactivated")}: {new Date(dogowor.deactivate_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
            {(!user.dogowors || user.dogowors.length === 0) && <div className={`text-sm italic text-gray-500 dark:text-white/50`}>-</div>}
          </div>
        ),
      },
      {
        key: "fullName",
        label: t("fullName"),
        width: "w-48",
        sortable: true,
        render: (user) => (
          <div className="space-y-1">
            <div className={`font-semibold text-gray-900 dark:text-white`}>
              {user.surname} {user.name}
            </div>
            {user.patronymic && <div className={`text-sm text-gray-600 dark:text-white/70`}>{user.patronymic}</div>}
          </div>
        ),
      },
      {
        key: "number",
        label: t("number"),
        width: "w-24",
        sortable: true,
        render: (user) => (
          <div className="flex items-center gap-2">
            <div
              className={`font-mono text-sm px-3 py-1 rounded-lg inline-block transition-colors bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:ring-yellow-400/10 shadow-sm`}
            >
              {user.number || "-"}
            </div>
          </div>
        ),
      },
      {
        key: "login",
        label: t("login"),
        width: "w-32",
        sortable: true,
        render: (user) => {
          const login = user.dogowors?.find((d) => d.login)?.login;
          return login || "-";
        },
      },
      {
        key: "phone",
        label: t("Cell Number"),
        width: "w-32",
        sortable: true,
        render: (user) => <div className={`font-mono text-gray-900 dark:text-white`}>{user.phone || "-"}</div>,
      },
      {
        key: "type",
        label: t("subscriberType"),
        width: "w-32",
        sortable: true,
        render: (user) => <span className="text-sm text-gray-700 dark:text-gray-300">{user.is_enterprises ? t("enterprises") : t("individuals")}</span>,
      },
      {
        key: "hbType",
        label: t("economicBudget"),
        width: "w-32",
        sortable: true,
        render: (user) => {
          if (!user.is_enterprises) return <div className={`text-sm italic text-gray-500 dark:text-white/50`}>-</div>;
          return user.hb_type ? (
            <span
              className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                user.hb_type === "hoz" ? "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300" : "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
              }`}
            >
              {user.hb_type === "hoz" ? t("economic") : t("budget")}
            </span>
          ) : (
            <div className={`text-sm italic text-gray-500 dark:text-white/50`}>-</div>
          );
        },
      },
      {
        key: "account",
        label: t("account"),
        width: "w-32",
        sortable: true,
        render: (user) => {
          if (!user.is_enterprises) return <div className={`text-sm italic text-gray-500 dark:text-white/50`}>-</div>;
          return user.account ? (
            <div className={`font-mono text-sm px-2 py-1 rounded text-gray-800 bg-gray-200 dark:text-white dark:bg-white/10`}>{user.account}</div>
          ) : (
            <div className={`text-sm italic text-gray-500 dark:text-white/50`}>-</div>
          );
        },
      },
      {
        key: "etrap",
        label: t("etrap"),
        width: "w-48",
        sortable: true,
        render: (user) => <div className={`text-sm text-gray-900 dark:text-white`}>{user.etrap || "-"}</div>,
      },
      {
        key: "address",
        label: t("address"),
        width: "w-48",
        sortable: true,
        render: (user) => <div className={`text-sm text-gray-900 dark:text-white`}>{user.address || "-"}</div>,
      },
      {
        key: "comment",
        label: t("comment"),
        width: "w-48",
        sortable: false, // сложная колонка, не сортируем
        render: (user) => (
          <div>
            {user.dogowors?.map((d, idx) => {
              return d.balance_type2 == "telefon" && <div key={idx}>{d.comment}</div>;
            })}
          </div>
        ),
      },
      {
        key: "abonplata",
        label: t("abonplata"),
        width: "w-32",
        sortable: true,
        render: (user) => (
          <div className={`text-sm font-medium ${user.abonplata ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {parseFloat(user.abonplata) > 0 ? parseFloat(user.abonplata).toFixed(2) : ""}
          </div>
        ),
      },
      {
        key: "services",
        label: t("services"),
        width: "w-48",
        // sortable: false,
        // sortKey: "services_count",
        sortable: true,
        render: (user) => (
          <div className="text-sm">
            {user.services && user.services.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {user.services.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <span className="text-gray-600 dark:text-gray-300 truncate">{s.service}</span>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400 text-xs bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded">{s.price} man.</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm italic text-gray-400 dark:text-gray-500 text-center py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">{t("no services")}</div>
            )}
          </div>
        ),
      },
      {
        key: "id",
        label: "ID",
        width: "w-20",
        sortable: true,
        render: (user) => <div className={`font-mono text-xs text-gray-500 dark:text-white/50`}>#{user.id}</div>,
      },
    ],
    [t, selectedRows, setSelectedRows, sortConfig]
  );

  // Фильтруем видимые колонки
  const visibleColumnDefinitions = columns.filter((col) => visibleColumns[col.key]);

  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const toggleAllRows = () => {
    if (selectedRows.size === users.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(users.map((user) => user.id)));
    }
  };

  // Получаем позицию кнопки для портала
  const [buttonRect, setButtonRect] = useState(null);
  const [pageInput, setPageInput] = useState(currentPage || 1);

  useEffect(() => {
    if (showColumnSettings && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
  }, [showColumnSettings]);

  useEffect(() => {
    setPageInput(currentPage || 1);
  }, [currentPage]);

  // Dropdown через Portal
  const DropdownContent = () => {
    if (!showColumnSettings || !buttonRect) return null;

    return createPortal(
      <div
        ref={dropdownRef}
        className="fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl z-50 min-w-48 max-h-96 overflow-y-auto"
        style={{
          top: buttonRect.bottom + window.scrollY + 8,
          left: buttonRect.right + window.scrollX - 192,
        }}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
          <h4 className="text-gray-900 dark:text-white font-medium text-sm">{t("showColumns")}</h4>
        </div>
        <div className="p-2 space-y-1">
          {columns.map((column) => (
            <label key={column.key} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded cursor-pointer">
              <input type="checkbox" checked={visibleColumns[column.key]} onChange={() => toggleColumn(column.key)} className="rounded border-gray-400 text-blue-500 focus:ring-blue-500" />
              <span className="text-gray-900 dark:text-white text-sm flex-1">{column.label}</span>
              {visibleColumns[column.key] ? <Eye size={14} className="text-green-600 dark:text-green-400" /> : <EyeOff size={14} className="text-red-600 dark:text-red-400" />}
            </label>
          ))}
        </div>
      </div>,
      document.body
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-white mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-300 mt-4">{t("loading")}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("noResults")}</h3>
        <p className="text-gray-600 dark:text-white/70 text-sm">{t("searchHint")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden w-full">
      {/* Заголовок таблицы с управлением колонками */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {selectedRows.size > 0 && (
            <span className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded dark:text-blue-300 dark:bg-blue-500/20">
              {t("selected")}: {selectedRows.size}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors border border-gray-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20"
            >
              <Settings size={16} />
              <span className="text-sm">{t("columns")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown через Portal */}
      <DropdownContent />

      {/* Таблица на всю ширину */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left text-gray-900 dark:text-white/90">
          <thead className="bg-gray-200 dark:bg-white/10 sticky top-0">
            <tr>
              {visibleColumnDefinitions.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-3 font-semibold border-b border-gray-300 dark:border-white/20 align-top ${column.width} ${
                    column.sortable ? "cursor-pointer hover:bg-gray-300 dark:hover:bg-white/20" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.key === "checkbox" ? (
                      <input
                        type="checkbox"
                        checked={selectedRows.size === users.length && users.length > 0}
                        onChange={toggleAllRows}
                        className="rounded border-gray-400 text-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <>
                        <span>{column.label}</span>
                        {column.sortable && getSortIcon(column.key)}
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className={`border-b transition-colors bg-white hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10 border-gray-200 dark:border-white/10`}>
                {visibleColumnDefinitions.map((column) => (
                  <td key={column.key} className={`px-3 py-3 align-top ${column.width}`}>
                    {column.render(user)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="text-sm text-gray-700 dark:text-white/80">
          {totalCount > 0 ? (
            <>
              {t(`Showing`)}: <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span>
              {` - `}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> {t(`of`)} <span className="font-medium">{totalCount}</span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-white/60">{`No results`}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-white/80">{t("Per page")}:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
              className="text-sm bg-white text-gray-900 dark:bg-white/5 dark:text-white rounded px-2 py-1 border border-gray-300 dark:border-white/10"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              className={`px-3 py-1 rounded text-sm border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white ${
                currentPage <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              {t("Prev")}
            </button>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={totalPages || 1}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value ? Number(e.target.value) : "")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = Number(pageInput) || 1;
                    const goto = Math.min(Math.max(1, Math.floor(val)), totalPages || Math.floor(val));
                    if (onPageChange) onPageChange(goto);
                  }
                }}
                className="w-20 text-sm px-2 py-1 rounded bg-white text-gray-900 border border-gray-300 dark:bg-white/5 dark:text-white dark:border-white/10"
              />
              <button
                onClick={() => {
                  const val = Number(pageInput) || 1;
                  const goto = Math.min(Math.max(1, Math.floor(val)), totalPages || Math.floor(val));
                  if (onPageChange) onPageChange(goto);
                }}
                className={`px-3 py-1 rounded text-sm border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5`}
              >
                {t("Show")}
              </button>
              <div className="text-sm text-gray-600 dark:text-white/60">
                {t("of")} {totalPages || 1}
              </div>
            </div>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              className={`px-3 py-1 rounded text-sm border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white ${
                currentPage >= totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              {t("Next")}
            </button>
          </div>
        </div>
      </div>

      <MyModal isOpen={infoModal.status} onClose={() => setInfoModal({ status: false, user: null })} title={`История изменений - Пользователь #${infoModal.user}`}>
        {loadingHistory ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Загрузка истории...</p>
          </div>
        ) : userHistory.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {userHistory.map((history) => {
              console.log("history", history);

              return (
                <div key={history.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
                  {/* Заголовок события */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          history.action === "Создать"
                            ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
                            : history.action === "Изменить"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
                            : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
                        }`}
                      >
                        {t(history.action)}
                      </span>
                      {history.field_name && <span className="text-sm text-gray-600 dark:text-gray-400">{history.field_name}</span>}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{history.created_at}</span>
                  </div>

                  {/* Изменения */}
                  <ChangesDisplay oldValue={history.old_value} newValue={history.new_value} />

                  {/* Дополнительная информация */}
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span>
                      ( {history.changed_by} ) {history.changed_by_surname} {history.changed_by_name}
                    </span>
                    {history.ip_address && <span>IP: {history.ip_address}</span>}
                  </div>

                  {/* Комментарий */}
                  {/* {history.comment && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm">
                    <span className="font-medium">Комментарий:</span> {history.comment}
                  </div>
                )} */}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Нет данных об изменениях</div>
        )}
      </MyModal>
    </div>
  );
};

export default UsersTable;
