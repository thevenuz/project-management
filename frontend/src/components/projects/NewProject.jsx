import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select'; 
import LogoutButton from '../login/Logout';

const NewProject = () => {
  const [project, setProject] = useState({
    project_id: '',
    project_title: '',
    project_description: '',
    start_date: '',
    expected_finish_date: '',
    budget: 0,
    created_by: '',
    manager: '',
    employees: [],
    tasks: []
  });

  const [currentEmployee, setCurrentEmployee] = useState('');
  const [managers, setManagers] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]); 
  const navigate = useNavigate();

  console.log("Managers: ", managers);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  const handleManagerChange = (e) => {
    setProject((prevProject) => ({
      ...prevProject,
      manager: e.target.value,
    }));
  };

  const handleEmployeeChange = (selectedOptions) => {
    const employees = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setProject((prevProject) => ({
      ...prevProject,
      employees: employees,
    }));
  };

  useEffect(() => {
    fetchManagers();
    fetchEmployees();
  }, []);

  const fetchManagers = () => {
    fetch('http://localhost:5000/prm/managers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching managers');
        }
        return response.json();
      })
      .then((data) => {
        const mgrs = data.map((mgr) => mgr.username);
        setManagers(mgrs);
      })
      .catch((error) => console.error('Fetch error:', error));
  };

  const fetchEmployees = () => {
    fetch('http://localhost:5000/prm/employees', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching employees');
        }
        return response.json();
      })
      .then((data) => {
        const options = data.map((emp) => ({ value: emp.username, label: emp.username }));
        setEmployeeOptions(options);
      })
      .catch((error) => console.error('Fetch error:', error));
  };

  const submitProject = () => {
    const user = localStorage.getItem('username');
    if (user !== undefined) {
      project.created_by = user;
    } else {
      console.log("User not found");
    }
    fetch('http://localhost:5000/prm/project/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Project created:', data);
        navigate('/projects');
      })
      .catch((error) => {
        console.error('Error creating project:', error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitProject();
    console.log(project);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Create Project</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="project_title">
            Project Title
          </label>
          <input
            type="text"
            id="project_title"
            name="project_title"
            value={project.project_title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="project_description">
            Project Description
          </label>
          <textarea
            id="project_description"
            name="project_description"
            value={project.project_description}
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
            value={project.start_date}
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
            value={project.expected_finish_date}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="budget">
            Budget
          </label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={project.budget}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="manager">
            Manager
          </label>
          <select
            id="manager"
            name="manager"
            value={project.manager}
            onChange={handleManagerChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="" disabled>Select Manager</option>
            {managers.map((mgr) => (
              <option key={mgr} value={mgr}>{mgr}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employees">
            Employees
          </label>
          <Select
            isMulti
            options={employeeOptions}
            value={employeeOptions.filter(option => project.employees.includes(option.value))}
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
      <LogoutButton />
    </div>
  );
}

export default NewProject;
