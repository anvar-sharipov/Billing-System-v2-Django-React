import { useEffect } from "react"
import UsersHead from "./UsersHead"
import { useTranslation } from "react-i18next";


const Users = () => {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = t("Users")
  }, [t])
  return (
    <div>
      <UsersHead />
    </div>
  )
}

export default Users