import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.setItem("role", "");
        localStorage.setItem("username", "");
        navigate('/');
    };

    return (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center">
            <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={logout}
            >
                Log out
            </button>
        </div>
    );
};

export default LogoutButton;
