// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Search, Filter, User, Phone, FileText, Building, Activity, Hash, MapPin } from "lucide-react";

// export default function UserTableFilters({ onSearch, onFilter, etraps }) {
//   const [searchType, setSearchType] = useState("users"); // users, phone, dogowor
//   const [filters, setFilters] = useState({
//     is_active: "",
//     is_enterprises: "",
//     hb_type: "",
//     account: "",
//     etrap: ""
//   });
//   const [searchValues, setSearchValues] = useState({
//     name: "",
//     surname: "",
//     patronymic: "",
//     phone: "",
//     dogowor: ""
//   });
//   const [showFilters, setShowFilters] = useState(false);

//   const handleSearchTypeChange = (type) => {
//     setSearchType(type);
//     // Очищаем поисковые значения при смене типа
//     setSearchValues({
//       name: "",
//       surname: "",
//       patronymic: "",
//       phone: "",
//       dogowor: ""
//     });
//   };

//   const handleSearchChange = (field, value) => {
//     const newValues = { ...searchValues, [field]: value };
//     setSearchValues(newValues);
    
//     if (onSearch) {
//       onSearch({ type: searchType, values: newValues });
//     }
//   };

//   const handleFilterChange = (field, value) => {
//     const newFilters = { ...filters, [field]: value };
//     setFilters(newFilters);
    
//     if (onFilter) {
//       onFilter(newFilters);
//     }
//   };

//   const clearAllFilters = () => {
//     setFilters({
//       is_active: "",
//       is_enterprises: "",
//       hb_type: "",
//       account: "",
//       etrap: ""
//     });
//     setSearchValues({
//       name: "",
//       surname: "",
//       patronymic: "",
//       phone: "",
//       dogowor: ""
//     });
//     if (onFilter) onFilter({});
//     if (onSearch) onSearch({ type: searchType, values: {} });
//   };

//   const SearchInput = ({ field, placeholder, icon: Icon }) => (
//     <motion.div
//       initial={{ opacity: 0, x: -10 }}
//       animate={{ opacity: 1, x: 0 }}
//       className="relative flex-1"
//     >
//       <Icon
//         size={18}
//         className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-300"
//       />
//       <input
//         type="text"
//         value={searchValues[field]}
//         onChange={(e) => handleSearchChange(field, e.target.value)}
//         placeholder={placeholder}
//         className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
//       />
//     </motion.div>
//   );

//   const FilterSelect = ({ field, options, placeholder, icon: Icon }) => (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="relative"
//     >
//       <Icon
//         size={16}
//         className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-300"
//       />
//       <select
//         value={filters[field]}
//         onChange={(e) => handleFilterChange(field, e.target.value)}
//         className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer transition-all duration-200"
//       >
//         <option value="">{placeholder}</option>
//         {options.map((option) => (
//           <option key={option.value} value={option.value}>
//             {option.label}
//           </option>
//         ))}
//       </select>
//     </motion.div>
//   );

//   return (
//     <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
//       {/* Основной поиск */}
//       <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
//         {/* Выбор типа поиска */}
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl"
//         >
//           {[
//             { value: "users", label: "Пользователи", icon: User },
//             { value: "phone", label: "Телефон", icon: Phone },
//             { value: "dogowor", label: "Договор", icon: FileText }
//           ].map((type) => (
//             <button
//               key={type.value}
//               onClick={() => handleSearchTypeChange(type.value)}
//               className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
//                 searchType === type.value
//                   ? "bg-white dark:bg-gray-600 shadow-md text-blue-600 dark:text-blue-400"
//                   : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
//               }`}
//             >
//               <type.icon size={16} />
//               <span className="text-sm font-medium">{type.label}</span>
//             </button>
//           ))}
//         </motion.div>

//         {/* Поля поиска в зависимости от типа */}
//         <div className="flex-1 w-full">
//           <AnimatePresence mode="wait">
//             {searchType === "users" && (
//               <motion.div
//                 key="users-search"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="flex flex-col sm:flex-row gap-3"
//               >
//                 <SearchInput field="surname" placeholder="Фамилия" icon={User} />
//                 <SearchInput field="name" placeholder="Имя" icon={User} />
//                 <SearchInput field="patronymic" placeholder="Отчество" icon={User} />
//               </motion.div>
//             )}

//             {searchType === "phone" && (
//               <motion.div
//                 key="phone-search"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="flex gap-3"
//               >
//                 <SearchInput field="phone" placeholder="Номер телефона" icon={Phone} />
//               </motion.div>
//             )}

//             {searchType === "dogowor" && (
//               <motion.div
//                 key="dogowor-search"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="flex gap-3"
//               >
//                 <SearchInput field="dogowor" placeholder="Номер договора" icon={FileText} />
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* Кнопка фильтров */}
//         <motion.button
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           onClick={() => setShowFilters(!showFilters)}
//           className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
//             showFilters
//               ? "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
//               : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
//           }`}
//         >
//           <Filter size={18} />
//           <span className="text-sm font-medium">Фильтры</span>
//         </motion.button>
//       </div>

//       {/* Дополнительные фильтры */}
//       <AnimatePresence>
//         {showFilters && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600"
//           >
//             <FilterSelect
//               field="is_active"
//               options={[
//                 { value: "true", label: "Активные" },
//                 { value: "false", label: "Неактивные" }
//               ]}
//               placeholder="Статус"
//               icon={Activity}
//             />

//             <FilterSelect
//               field="is_enterprises"
//               options={[
//                 { value: "true", label: "Предприятия" },
//                 { value: "false", label: "Физ. лица" }
//               ]}
//               placeholder="Тип"
//               icon={Building}
//             />

//             <FilterSelect
//               field="hb_type"
//               options={[
//                 { value: "hoz", label: "Хозяйственный" },
//                 { value: "budjet", label: "Бюджетный" }
//               ]}
//               placeholder="Хоз/Бюджет"
//               icon={Hash}
//             />

//             <FilterSelect
//               field="account"
//               options={[
//                 { value: "with_account", label: "Со счетом" },
//                 { value: "without_account", label: "Без счета" }
//               ]}
//               placeholder="Счет"
//               icon={Hash}
//             />

//             <FilterSelect
//               field="etrap"
//               options={etraps?.map(etrap => ({
//                 value: etrap.id,
//                 label: etrap.etrap
//               })) || []}
//               placeholder="Этрап"
//               icon={MapPin}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Кнопка сброса фильтров */}
//       {(Object.values(filters).some(val => val !== "") || Object.values(searchValues).some(val => val !== "")) && (
//         <motion.button
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           onClick={clearAllFilters}
//           className="px-4 py-2 text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
//         >
//           Сбросить все фильтры
//         </motion.button>
//       )}
//     </div>
//   );
// }