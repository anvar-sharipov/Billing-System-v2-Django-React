import { TestTube, TestTube2, Beaker, FlaskConical, FlaskRound, Microscope, Atom, Calculator, FileCheck, FileQuestion, ClipboardCheck, ClipboardList } from "lucide-react";

const FastFillDefaultFields = ({ values, setFieldValue }) => {
  const now = new Date();
  const currentDateTime = now.toISOString().slice(0, 16);

  const handleFillDefaultFields = () => {
    setFieldValue("name", "Anvar");
    setFieldValue("surname", "Sharipov");
    setFieldValue("patronymic", "Kutlimuratowich");
    setFieldValue("address", "Merkez-2, jay-3, oy 55");
    setFieldValue("etrap", 1);
    setFieldValue("mobile_number", "61304356");
    setFieldValue("comment", "test comment ilat");
    setFieldValue("dogowor", "993322400");
    setFieldValue("number", "400");
    setFieldValue("activate_at", currentDateTime);
    setFieldValue("abonplata", "1");
  };

  const handleFillDefaultFieldsEdara = () => {
    setFieldValue("name", "Daşoguz Azyk Önümleri ");
    setFieldValue("address", "Merkez-2, jay-3, oy 55");
    setFieldValue("etrap", 1);
    setFieldValue("mobile_number", "61304356");
    setFieldValue("comment", "test comment edara");
    setFieldValue("account", 2);
    setFieldValue("hb_type", "hoz");
    setFieldValue("dogowor", "993322400");
    setFieldValue("number", "400");
    setFieldValue("activate_at", currentDateTime);
    setFieldValue("abonplata", "1");
  };

  return (
    <div className="flex">
      {values.is_enterprises ? (
        <div className="cursor-pointer" onClick={handleFillDefaultFieldsEdara} title="Заполнить тестовыми данными edara">
          <FileCheck size={20} />
        </div>
      ) : (
        <div className="cursor-pointer" onClick={handleFillDefaultFields} title="Заполнить тестовыми данными ilat">
          <FileQuestion size={20} />
        </div>
      )}
    </div>
  );
};

export default FastFillDefaultFields;
