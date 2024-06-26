import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import LogoutButton from "../login/Logout";

const EditTask = () => {
    const [task, setTask] = useState({    
        task_title: '',
        task_description: '',
        assigned_team: '',
        start_date: '',
        expected_finish_date: '',
        task_status: 'Active',
        employees: [],
        tickets: [],
    });

    const [project, setProject] = useState({});
    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();
    const { pid, tskid } = useParams(); 

    useEffect(() => {
        fetchProjectDetails();
        fetchTaskDetails();
    }, []);

    const fetchProjectDetails = () => {
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
            const options = data.data.employees.map((emp) => ({ value: emp, label: emp }));
            setEmployees(options);
        })
        .catch((error) => console.error('Fetch error:', error));
    };

    const fetchTaskDetails = () => {
        fetch(`http://localhost:5000/prm/tasks/${tskid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json'
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
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTask((prevTask) => ({
            ...prevTask,
            [name]: value,
        }));
    };

    const handleEmployeeChange = (selectedOptions) => {
        const employees = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setTask((prevTask) => ({
            ...prevTask,
            employees: employees,
        }));
    };

    const updateTask = () => {
        fetch(`http://localhost:5000/prm/projects/${pid}/tasks/${tskid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            body: JSON.stringify(task),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Task updated:', data);
            navigate(`/projects/${pid}/tasks/${tskid}`);
        })
        .catch((error) => {
            console.error('Error updating task:', error);
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateTask();
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
            {project && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold">{project.project_id}: {project.project_title}</h2>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="task_title">
                        Task Title
                    </label>
                    <input
                        type="text"
                        id="task_title"
                        name="task_title"
                        value={task.task_title}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="task_description">
                        Task Description
                    </label>
                    <textarea
                        id="task_description"
                        name="task_description"
                        value={task.task_description}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assigned_team">
                        Assigned Team
                    </label>
                    <input
                        type="text"
                        id="assigned_team"
                        name="assigned_team"
                        value={task.assigned_team}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_date">
                        Start Date
                    </label>
                    <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={task.start_date}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expected_finish_date">
                        Expected Finish Date
                    </label>
                    <input
                        type="date"
                        id="expected_finish_date"
                        name="expected_finish_date"
                        value={task.expected_finish_date}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employees">
                        Employees
                    </label>
                    <Select
                        isMulti
                        options={employees}
                        value={employees.filter(option => task.employees.includes(option.value))}
                        onChange={handleEmployeeChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Submit
                    </button>
                </div>
            </form>
            <LogoutButton/>
        </div>
    );
}

export default EditTask;
