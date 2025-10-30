import MiniButton from "../../UI/MiniButton";
import myAxios from "../../../services/myAxios";
import { useState } from "react";

const AddTestData = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const add200Users = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await myAxios.post("core/create-200-test-users/");
      if (res.data.success) {
        setMessage(`${res.data.message} (Users: ${res.data.details.individual_users}, Enterprises: ${res.data.details.enterprises})`);
      } else {
        setError(res.data.error || "Something went wrong");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="space-y-4">
        {/* Заголовок */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Test Data Generation</h3>
          <p className="text-sm text-gray-600">Add 200 test users from 20000 to 20200</p>
        </div>

        {/* Кнопка */}
        <div className="flex justify-center">
          <MiniButton onClick={add200Users} disabled={loading} className={`min-w-[120px] ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 transition-transform"}`}>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              "Generate Users"
            )}
          </MiniButton>
        </div>

        {/* Сообщения */}
        {message && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Дополнительная информация */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-1">What this does:</h4>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Creates 200 individual users (numbers 20000-20200)</li>
            <li>• Creates 50 enterprises per etrap (numbers 30000+)</li>
            <li>• Distributes users across all active etraps</li>
            <li>• Ensures unique numbers and contracts</li>
            <li>• Generates mobile numbers and contracts automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddTestData;
