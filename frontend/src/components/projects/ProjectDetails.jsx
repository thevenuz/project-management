import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LogoutButton from "../login/Logout";

const ProjectDetails = () => {
    const [project, setProject] = useState({});
    const [errorMessage, setErrorMessage] = useState(""); 
    const navigate = useNavigate();
    const { pid } = useParams();
    console.log("Project data: ", project);

    const goToTask = (tid) => {
        navigate(`/projects/${pid}/tasks/${tid}`);
    }

    const fetchProject = () => {
        fetch(`http://localhost:5000/prm/projects/${pid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error fetching project details");
                }
                return response.json();
            })
            .then((data) => {
                setProject(data.data);
            })
            .catch((error) => console.error('Fetch error:', error));
    }

    const deleteProject = () => {
        const role = localStorage.getItem('role');
        if (role !== 'admin' && role !== 'manager') {
            console.log("You are not authorized to delete the project");
            setErrorMessage("You are not authorized to delete the project");
            return;
        }

        fetch(`http://localhost:5000/prm/project/${pid}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error deleting project");
                }
                navigate('/projects');
            })
            .catch((error) => console.error('Delete error:', error));
    }

    useEffect(() => {
        fetchProject();
    }, []);

    const goToEditTask = () => {
        const role = localStorage.getItem('role');
        if (role !== 'admin' && role !== 'manager') {
            console.log("You are not authorized to edit the project");
            setErrorMessage("You are not authorized to edit the project");
            return;
        }
        navigate(`/projects/${pid}/edit`);
    }

    const goToAddTask = () => {
        const role = localStorage.getItem('role');
        if (role !== 'admin' && role !== 'manager') {
            console.log("You are not authorized to add a task");
            setErrorMessage("You are not authorized to add a task");
            return;
        }
        navigate(`/project/${pid}/task/new`);
    }

    return (
        <div className="container mx-auto p-4">
            {Object.keys(project).length === 0
                ? <div className="text-center text-lg">Loading...</div>
                : <div className="">
                    <h1 className="font-extrabold text-4xl mb-6 text-center">Project Details</h1>
                    <div className="flex justify-center mb-6 space-x-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button" onClick={goToEditTask}
                        >
                            Edit Project
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={deleteProject}
                        >
                            Delete Project
                        </button>
                    </div>
                    {errorMessage && (
                        <p className="mt-4 text-red-500 text-center">{errorMessage}</p>
                    )}
                    <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                        <div className="mb-4">
                            <h2 className="text-3xl font-bold">{project.project_id}: {project.project_title}</h2>
                        </div>
                        <div className="mb-4">
                            <p className="font-medium text-lg">Created by: {project.created_by}</p>
                        </div>
                        <div className="mb-4">
                            <p className="font-medium text-lg">Managed by: {project.manager}</p>
                        </div>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border p-4 rounded-md">
                                <p className="font-medium">Status: {project.project_status}</p>
                            </div>
                            <div className="border p-4 rounded-md">
                                <p className="font-medium">Budget: {project.budget} USD</p>
                            </div>
                            <div className="border p-4 rounded-md">
                                <p className="font-medium">Start date: {project.start_date}</p>
                            </div>
                            <div className="border p-4 rounded-md">
                                <p className="font-medium">Expected finish date: {project.expected_finish_date}</p>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg">Description:</h3>
                            <p className="mt-2">{project.project_description}</p>
                        </div>
                        <div className="mb-6">
                            <h3 className="font-bold text-lg">Assigned Employees:</h3>
                            <ul className="list-disc pl-5 mt-2">
                                {project.employees.map((employee, index) => (
                                    <li key={index} className="mt-1">{employee}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="mb-6">
                            <h3 className="font-bold text-lg">Tasks:</h3>
                            <ul className="list-disc pl-5 mt-2">
                                {project.tasks.map((task, index) => (
                                    <li
                                        key={index}
                                        className="mt-1 cursor-pointer text-blue-600 hover:underline"
                                        onClick={() => goToTask(task.task_id)}
                                    >
                                        {task.task_id}: {task.task_title}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4">
                                <button
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="button"
                                    onClick={goToAddTask}
                                >
                                    Add Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>}
            <LogoutButton/>
        </div>
    );
}

export default ProjectDetails;
