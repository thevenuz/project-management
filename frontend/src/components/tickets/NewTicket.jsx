import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import LogoutButton from "../login/Logout";

const NewTicket = () => {
    const [ticket, setTicket] = useState({
        ticket_title: "",
        ticket_description: "",
        ticket_type: "",
        created_by: "",
        assigned_user: "", 
        ticket_status: "Open", 
        created_date: new Date().toISOString().split("T")[0], 
        last_updated_date: null,
        closed_date: null,
        comments: [],
        employees: []
    });

    const [task, setTask] = useState({});
    const [employees, setEmployees] = useState([]);
    const { pid, tskid } = useParams();
    
    const navigate = useNavigate();

    
    
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTicket((prevTicket) => ({
            ...prevTicket,
            [name]: value,
        }));
    };

    const handleEmployeeChange = (selectedOptions) => {
        const selectedEmployees = selectedOptions.map(option => option.value);
        setTicket((prevTicket) => ({
            ...prevTicket,
            employees: selectedEmployees,
        }));
    };

    const handleAssignedUserChange = (selectedOption) => {
        setTicket((prevTicket) => ({
            ...prevTicket,
            assigned_user: selectedOption.value,
        }));
    };

    const submitTicket = () => {
        const user = localStorage.getItem('username');
        ticket.created_by = user;
        fetch(`http://localhost:5000/prm/tasks/${tskid}/ticket/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticket),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Ticket created:', data);
            navigate(`/projects/${pid}/tasks/${tskid}`);
        })
        .catch((error) => {
            console.error('Error creating ticket:', error);
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitTicket();
    };

    useEffect(() => {
        fetch(`http://localhost:5000/prm/tasks/${tskid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then((data) => {
            console.log('Task data:', data.data);
            setTask(data.data);
            const options = data.data.employees.map((emp) => ({ value: emp, label: emp }));
            setEmployees(options);
        }).catch((error) => {
            console.error('Fetch error:', error);
        });
    },[]);

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-6">Create New Ticket</h1>
            {task && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold">{task.task_id}: {task.task_title}</h2>
                </div>
            )}
            <form onSubmit={handleSubmit}>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ticket_title">
                        Ticket Title
                    </label>
                    <input
                        type="text"
                        id="ticket_title"
                        name="ticket_title"
                        value={ticket.ticket_title}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ticket_description">
                        Ticket Description
                    </label>
                    <textarea
                        id="ticket_description"
                        name="ticket_description"
                        value={ticket.ticket_description}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ticket_type">
                        Ticket Type
                    </label>
                    <input
                        type="text"
                        id="ticket_type"
                        name="ticket_type"
                        value={ticket.ticket_type}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assigned_user">
                        Assigned User
                    </label>
                    <Select
                        options={task.employees ? task.employees.map(emp => ({ value: emp, label: emp })) : []}
                        value={ticket.assigned_user ? { value: ticket.assigned_user, label: ticket.assigned_user } : null}
                        onChange={handleAssignedUserChange}
                        className="basic-single-select"
                        classNamePrefix="select"
                    />
                </div>

                {/* <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employees">
                        Employees
                    </label>
                    <Select
                        isMulti
                        options={employees}
                        value={employees.filter(option => ticket.employees.includes(option.value))}
                        onChange={handleEmployeeChange}
                        className="basic-multi-select"
                        classNamePrefix="select"
                    />
                </div> */}

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
};

export default NewTicket;
