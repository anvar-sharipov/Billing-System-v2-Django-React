import { useMemo, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Eye, EyeOff, Download, Edit, MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";

const UsersTable = ({ users, loading, selectedRows, setSelectedRows }) => {
  const { t } = useTranslation();
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowColumnSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Загружаем настройки колонок из localStorage
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('usersTableColumns');
    return saved ? JSON.parse(saved) : {
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
      id: true
    };
  });

  // Сохраняем настройки колонок в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('usersTableColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Определяем колонки
  const columns = useMemo(() => [
    { 
      key: 'checkbox', 
      label: '', 
      width: 'w-12',
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
      )
    },
    { 
      key: 'actions', 
      label: '', 
      width: 'w-16',
      render: (user) => (
        <div className="flex gap-1">
          <button className={`p-1 rounded ${
            user.is_active 
              ? 'text-blue-400 hover:text-blue-300 hover:bg-white/10' 
              : 'text-gray-500 hover:text-gray-400 hover:bg-white/5'
          }`}>
            <Edit size={14} />
          </button>
          <button className={`p-1 rounded ${
            user.is_active 
              ? 'text-gray-400 hover:text-gray-300 hover:bg-white/10' 
              : 'text-gray-500 hover:text-gray-400 hover:bg-white/5'
          }`}>
            <MoreVertical size={14} />
          </button>
        </div>
      )
    },
    { 
      key: 'contracts', 
      label: t('contractsBalance'), 
      width: 'w-80',
      render: (user) => (
        <div className="space-y-2">
          {user.dogowors?.map((dogowor, index) => (
            <div key={index} className={`space-y-1 p-2 rounded-lg ${
              user.is_active ? 'bg-white/5' : 'bg-gray-600/20'
            }`}>
              <div className="flex justify-between items-start gap-2">
                <div className={`font-mono text-sm break-all ${
                  user.is_active ? 'text-white' : 'text-gray-400'
                }`}>
                  {dogowor.dogowor}
                </div>
                {dogowor.login && (
                  <div className={`text-xs px-1 rounded ${
                    user.is_active ? 'text-white/50 bg-white/10' : 'text-gray-500 bg-gray-600/30'
                  }`}>
                    {dogowor.login}
                  </div>
                )}
              </div>
              <div className={`text-sm font-semibold ${
                parseFloat(dogowor.balance) < 0 
                  ? 'text-red-400' 
                  : user.is_active ? 'text-green-400' : 'text-green-500/70'
              }`}>
                ({dogowor.balance < 0 ? "-" : "+"}{parseFloat(dogowor.balance).toFixed(4)}) manat {/* {dogowor.balance_type} */}
              </div>
              {dogowor.activate_at && (
                <div className={`text-xs ${
                  user.is_active ? 'text-white/50' : 'text-gray-500'
                }`}>
                  {t('activated')}: {new Date(dogowor.activate_at).toLocaleDateString()}
                </div>
              )}
              {dogowor.deactivate_at && (
                <div className={`text-xs ${
                  user.is_active ? 'text-white/50' : 'text-gray-500'
                }`}>
                  {t('deactivated')}: {new Date(dogowor.deactivate_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
          {(!user.dogowors || user.dogowors.length === 0) && (
            <div className={`text-sm italic ${
              user.is_active ? 'text-white/50' : 'text-gray-500'
            }`}>
              -
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'fullName', 
      label: t('fullName'), 
      width: 'w-48',
      render: (user) => (
        <div className="space-y-1">
          <div className={`font-semibold ${
            user.is_active ? 'text-white' : 'text-gray-400'
          }`}>
            {user.surname} {user.name}
          </div>
          {user.patronymic && (
            <div className={`text-sm ${
              user.is_active ? 'text-white/70' : 'text-gray-500'
            }`}>
              {user.patronymic}
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'login', 
      label: t('login'), 
      width: 'w-32',
      render: (user) => {
        const login = user.dogowors?.find(d => d.login)?.login;
        return login ? (
          <div className={`font-mono text-sm px-2 py-1 rounded ${
            user.is_active ? 'text-white bg-white/10' : 'text-gray-400 bg-gray-600/30'
          }`}>
            {login}
          </div>
        ) : (
          <div className={`text-sm italic ${
            user.is_active ? 'text-white/50' : 'text-gray-500'
          }`}>
            -
          </div>
        );
      }
    },
    { 
      key: 'Cell Number', 
      label: t('Cell Number'), 
      width: 'w-32',
      render: (user) => (
        <div className={`font-mono ${
          user.is_active ? 'text-white' : 'text-gray-400'
        }`}>
          {user.phone || '-'}
        </div>
      )
    },
    { 
      key: 'number', 
      label: t('number'), 
      width: 'w-24',
      render: (user) => (
        <div className={`font-mono text-sm ${
          user.is_active ? 'text-white' : 'text-gray-400'
        }`}>
          {user.number || '-'}
        </div>
      )
    },
    { 
      key: 'type', 
      label: t('subscriberType'), 
      width: 'w-32',
      render: (user) => (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
          user.is_enterprises 
            ? user.is_active 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
              : 'bg-blue-500/10 text-blue-400/70 border border-blue-500/20'
            : user.is_active
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-purple-500/10 text-purple-400/70 border border-purple-500/20'
        }`}>
          {user.is_enterprises ? t('enterprises') : t('individuals')}
        </span>
      )
    },
    { 
      key: 'hbType', 
      label: t('economicBudget'), 
      width: 'w-32',
      render: (user) => {
        if (!user.is_enterprises) return (
          <div className={`text-sm italic ${
            user.is_active ? 'text-white/50' : 'text-gray-500'
          }`}>
            -
          </div>
        );
        return user.hb_type ? (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
            user.hb_type === 'hoz' 
              ? user.is_active
                ? 'bg-orange-500/20 text-orange-300'
                : 'bg-orange-500/10 text-orange-400/70'
              : user.is_active
                ? 'bg-green-500/20 text-green-300'
                : 'bg-green-500/10 text-green-400/70'
          }`}>
            {user.hb_type === 'hoz' ? t('economic') : t('budget')}
          </span>
        ) : (
          <div className={`text-sm italic ${
            user.is_active ? 'text-white/50' : 'text-gray-500'
          }`}>
            -
          </div>
        );
      }
    },
    { 
      key: 'account', 
      label: t('account'), 
      width: 'w-32',
      render: (user) => {
        if (!user.is_enterprises) return (
          <div className={`text-sm italic ${
            user.is_active ? 'text-white/50' : 'text-gray-500'
          }`}>
            -
          </div>
        );
        return user.account ? (
          <div className={`font-mono text-sm px-2 py-1 rounded ${
            user.is_active ? 'text-white bg-white/10' : 'text-gray-400 bg-gray-600/30'
          }`}>
            {user.account}
          </div>
        ) : (
          <div className={`text-sm italic ${
            user.is_active ? 'text-white/50' : 'text-gray-500'
          }`}>
            -
          </div>
        );
      }
    },
    { 
      key: 'etrap', 
      label: t('etrap'), 
      width: 'w-48',
      render: (user) => (
        <div className={`text-sm ${
          user.is_active ? 'text-white' : 'text-gray-400'
        }`}>
          {user.etrap || '-'}
        </div>
      )
    },
    { 
      key: 'address', 
      label: t('address'), 
      width: 'w-48',
      render: (user) => (
        <div className={`text-sm ${
          user.is_active ? 'text-white' : 'text-gray-400'
        }`}>
          {user.address || '-'}
        </div>
      )
    },
    { 
      key: 'id', 
      label: 'ID', 
      width: 'w-20',
      render: (user) => (
        <div className={`font-mono text-xs ${
          user.is_active ? 'text-white/50' : 'text-gray-500'
        }`}>
          #{user.id}
        </div>
      )
    }
  ], [t, selectedRows, setSelectedRows]);

  // Фильтруем видимые колонки
  const visibleColumnDefinitions = columns.filter(col => visibleColumns[col.key]);

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const toggleAllRows = () => {
    if (selectedRows.size === users.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(users.map(user => user.id)));
    }
  };

  // Получаем позицию кнопки для портала
  const [buttonRect, setButtonRect] = useState(null);
  
  useEffect(() => {
    if (showColumnSettings && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
  }, [showColumnSettings]);

  // Dropdown через Portal
  const DropdownContent = () => {
    if (!showColumnSettings || !buttonRect) return null;

    return createPortal(
      <div 
        ref={dropdownRef}
        className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 min-w-48 max-h-96 overflow-y-auto"
        style={{
          top: buttonRect.bottom + window.scrollY + 8,
          left: buttonRect.right + window.scrollX - 192,
        }}
      >
        <div className="p-3 border-b border-gray-600">
          <h4 className="text-white font-medium text-sm">{t('showColumns')}</h4>
        </div>
        <div className="p-2 space-y-1">
          {columns.map((column) => (
            <label key={column.key} className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={visibleColumns[column.key]}
                onChange={() => toggleColumn(column.key)}
                className="rounded border-gray-400 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-white text-sm flex-1">{column.label}</span>
              {visibleColumns[column.key] ? <Eye size={14} className="text-green-400" /> : <EyeOff size={14} className="text-red-400" />}
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="text-white/70 dark:text-gray-300 mt-4">{t('loading')}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{t('noResults')}</h3>
        <p className="text-white/70 text-sm">{t('searchHint')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden w-full">
      {/* Заголовок таблицы с управлением колонками */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">
            {t('searchResults')} <span className="text-white/70">({users.length})</span>
          </h3>
          {selectedRows.size > 0 && (
            <span className="text-sm text-blue-300 bg-blue-500/20 px-2 py-1 rounded">
              {t('selected')}: {selectedRows.size}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">

          
          <div className="relative">
            <button 
              ref={buttonRef}
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
            >
              <Settings size={16} />
              <span className="text-sm">{t('columns')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown через Portal */}
      <DropdownContent />

      {/* Таблица на всю ширину */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left text-white/90">
          <thead className="bg-white/10 sticky top-0">
            <tr>
              {visibleColumnDefinitions.map((column) => (
                <th 
                  key={column.key}
                  className={`px-3 py-3 font-semibold border-b border-white/20 align-top ${column.width}`}
                >
                  {column.key === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={selectedRows.size === users.length && users.length > 0}
                      onChange={toggleAllRows}
                      className="rounded border-gray-400 text-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr 
                key={user.id} 
                className={`border-b transition-colors ${
                  user.is_active
                    ? index % 2 === 0 
                      ? 'bg-white/5 hover:bg-white/10 border-white/10' 
                      : 'bg-white/10 hover:bg-white/15 border-white/10'
                    : index % 2 === 0
                      ? 'bg-gray-600/10 hover:bg-gray-600/20 border-gray-500/30'
                      : 'bg-gray-600/20 hover:bg-gray-600/30 border-gray-500/30'
                }`}
              >
                {visibleColumnDefinitions.map((column) => (
                  <td 
                    key={column.key}
                    className={`px-3 py-3 align-top ${column.width}`}
                  >
                    {column.render(user)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;