import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LogoutButton from "../login/Logout";

const Task = () => {
    const [task, setTask] = useState({});
    const [errorMessage, setErrorMessage] = useState(""); 
    const { pid, tskid } = useParams();
    const navigate = useNavigate();

    console.log("Task data: ", pid, tskid);
    const goToTicket = (tid) => {
        navigate(`/projects/${pid}/tasks/${tskid}/tickets/${tid}`);
    };

    const deleteTask = () => {
        const role = localStorage.getItem('role');
        if (role !== 'admin' && role !== 'manager') {
            console.log("You are not authorized to delete the project");
            setErrorMessage("You are not authorized to delete the project");
            return;
        }
        fetch(`http://localhost:5000/prm/tasks/${tskid}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error deleting task");
                }
                navigate('/projects'); 
            })
            .catch((error) => console.error('Delete error:', error));
    };

    const goToEditTask = () => {
        const role = localStorage.getItem('role');
        if (role !== 'admin' && role !== 'manager') {
            console.log("You are not authorized to edit the task");
            setErrorMessage("You are not authorized to edit the task");
            return;
        }
        navigate(`/projects/${pid}/tasks/${task.task_id}/edit`);
    };

    useEffect(() => {
        fetch(`http://localhost:5000/prm/tasks/${tskid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error fetching task details");
                }
                return response.json();
            })
            .then((data) => {
                setTask(data.data);
            })
            .catch((error) => console.error('Fetch error:', error));
    }, [tskid]);

    return (
        <div className="container mx-auto p-4">
            {Object.keys(task).length === 0
                ? <div className="text-center text-lg">Loading...</div>
                : <div>
                    <div className="mb-6 text-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={goToEditTask}
                        >
                            Edit Task
                        </button>
                        <button
                            onClick={deleteTask}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
                            type="button"
                        >
                            Delete Task
                        </button>
                    </div>
                    {errorMessage && (
                        <p className="mt-4 text-red-500 text-center">{errorMessage}</p>
                    )}
                    <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                        <div className="mb-4">
                            <h2 className="text-3xl font-bold">{task.task_id}: {task.task_title}</h2>
                        </div>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border p-4 rounded-md">
                                <p className="font-medium">Status: {task.task_status}</p>
                            </div>
                            <div className="border p-4 rounded-md">
                                <p className="font-medium">Assigned to team: {task.assigned_team}</p>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg">Description:</h3>
                            <p className="mt-2">{task.task_description}</p>
                        </div>
                        <div className="mb-6">
                            <h3 className="font-bold text-lg">Tickets:</h3>
                            <ul className="list-disc pl-5 mt-2">
                                {task.tickets.map((ticket, index) => (
                                    <li
                                        key={index}
                                        className="mt-1 cursor-pointer text-blue-600 hover:underline"
                                        onClick={() => goToTicket(ticket.ticket_id)}
                                    >
                                        {ticket.ticket_id}: {ticket.ticket_title}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate(`/projects/${pid}/task/${tskid}/ticket/new`)}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                                type="button"
                            >
                                Create Ticket
                            </button>
                        </div>
                    </div>
                </div>}
                <LogoutButton/>
        </div>
    );
};

export default Task;
