import { TestTube, TestTube2, Beaker, FlaskConical, FlaskRound, Microscope, Atom, Calculator, FileCheck, FileQuestion, ClipboardCheck, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import myAxios from "../../../../services/myAxios";

const FastFillDefaultFields = ({ values, setFieldValue }) => {
  const now = new Date();
  const currentDateTime = now.toISOString().slice(0, 16);
  const [nextEmptyNumber, setNextEmptyNumber] = useState(null)

  useEffect(() => {
    const getLatesEmptyNumber4Stansion = async () => {
      try {
        const res = await myAxios.get("core/getLatesEmptyNumber4Stansion");
        // console.log("res", res);
        setNextEmptyNumber(res.data.nextNumber)
      } catch (err) {
        console.log("cant get getLatesEmptyNumber4Stansion", err);
      }
    };
    getLatesEmptyNumber4Stansion();
  }, []);
  // console.log("tutututut");

  // console.log(typeof nextEmptyNumber);
  

  const handleFillDefaultFields = () => {
    setFieldValue("name", "Anvar");
    setFieldValue("surname", "Sharipov");
    setFieldValue("patronymic", "Kutlimuratowich");
    setFieldValue("address", "Merkez-2, jay-3, oy 55");
    setFieldValue("etrap", 1);
    setFieldValue("mobile_number", "61304356");
    setFieldValue("comment", "test comment ilat");
    setFieldValue("dogowor", `993322${nextEmptyNumber}`);
    setFieldValue("login", `993322${nextEmptyNumber}`);
    setFieldValue("number", nextEmptyNumber);
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
    setFieldValue("dogowor", `993322${nextEmptyNumber}`);
    setFieldValue("dogowor", `993322${nextEmptyNumber}`);
    setFieldValue("number", nextEmptyNumber);
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
