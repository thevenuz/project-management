import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../login/Logout";

const Projects = () => {
    const [projectsList, setProjects] = useState([]);
    const [errorMessage, setErrorMessage] = useState(""); 
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const navigate = useNavigate();

    const redirectToProject = (id) => {
        console.log("Redirecting to project:", id);
        navigate(`/projects/${id}`);
    };

    const createProject = () => {
        console.log("Redirecting to create project");
        if (role !== 'admin' && role !== 'manager') {
            console.log("You are not authorized to create a project");
            setErrorMessage("You are not authorized to create a project");
            return;
        }
        navigate('/project/new');
    };

    const createUser = () => {
        console.log("Redirecting to create user");
        if (role !== 'admin') {
            console.log("You are not authorized to create a user");
            setErrorMessage("You are not authorized to create a user");
            return;
        }
        navigate('/users');
    };

    const logout = () => {
        localStorage.setItem("role", "")
        navigate('/');
    }

    const fetchManagerProjects = (user) => {
        fetch(`http://localhost:5000/prm/projects/manager/${user}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log("Projects data: ", data.data);
                setProjects(data.data);
            })
            .catch((error) => console.error('Fetch error:', error));
    }

    const fetchEmployeeProjects = (user) => {
        fetch(`http://localhost:5000/prm/projects/employee/${user}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log("Projects data: ", data.data);
                setProjects(data.data);
            })
            .catch((error) => console.error('Fetch error:', error));

    }

    const fetchAllProjects = () => {
        fetch('http://localhost:5000/prm/projects', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log("Projects data: ", data.data);
                setProjects(data.data);
            })
            .catch((error) => console.error('Fetch error:', error));
    }

    useEffect(() => {
        const user = localStorage.getItem('username');
        const role = localStorage.getItem('role');
        setUsername(user);
        setRole(role);
        if (user === undefined || user === "" || role === undefined || role === "") {
            console.log("User not found");
            setErrorMessage("User or role not found");
            return;
        }
        if (role === 'admin') {
            fetchAllProjects();
        } else if (role === 'manager') {
            fetchManagerProjects(user);
        }
        else if (role === 'employee') {
            fetchEmployeeProjects(user);
        }
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="text-center mb-6">
                <h2 className="font-bold text-2xl">Welcome, {username}!</h2>
            </div>
            <h1 className="font-extrabold text-4xl mb-6 text-center">Projects</h1>
            <div className="mb-6 text-center">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={createProject}>
                    Create Project
                </button>
                {role === 'admin' && (
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 ml-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={createUser}>
                        Create User
                    </button>
                )}
                {errorMessage && (
                    <p className="mt-4 text-red-500">{errorMessage}</p>
                )}
            </div>
            {projectsList && projectsList.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {projectsList.map((project) => (
                        <div key={project.project_id} className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                            <div onClick={() => redirectToProject(project.project_id)} className="cursor-pointer">
                                <h2 className="text-xl font-bold mb-2 text-blue-600">{project.project_title}</h2>
                                <p className="text-gray-700">{project.project_description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600 mt-6">No projects created yet.</p>
            )}
            {/* <div className="mb-6 text-center">
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={logout}>
                    Log out
                </button>
                {errorMessage && (
                    <p className="mt-4 text-red-500">{errorMessage}</p>
                )}
            </div> */}
            <LogoutButton/>
        </div>
    );
};

export default Projects;
