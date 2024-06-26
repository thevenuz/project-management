import './App.css';
import Login from './components/login/Login';
import ProjectDetails from './components/projects/ProjectDetails';
import Projects from './components/projects/Projects';
import Task from './components/tasks/Task';
import NewTicket from './components/tickets/NewTicket';
import NewTask from './components/tasks/NewTask';
import Ticket from './components/tickets/Ticket';
import { Routes, Route, Router } from 'react-router-dom';
import { useState } from 'react';
import NewProject from './components/projects/NewProject';
import EditProject from './components/projects/EditProject';
import EditTask from './components/tasks/EditTask';
import EditTicket from './components/tickets/EditTicket';
import CreateUser from './components/login/AddUser';

function App() {
  return (
    <div className=' '>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/projects' element={<Projects />} />
        <Route path='/projects/:pid' element={<ProjectDetails />} />
        <Route path='/projects/:pid/tasks/:tskid' element={<Task />} />
        <Route
          path='/projects/:pid/tasks/:tskid/tickets/:tid'
          element={<Ticket />}
        />

        <Route path='/project/new' element={<NewProject />} />
        <Route path='/project/:pid/task/new' element={<NewTask />} />
        <Route
          path='/projects/:pid/task/:tskid/ticket/new'
          element={<NewTicket />}
        />
        <Route path='/projects/:pid/edit' element={<EditProject />} />
        <Route path='/projects/:pid/tasks/:tskid/edit' element={<EditTask />} />
        <Route
          path='/projects/:pid/tasks/:tskid/tickets/:tid/edit'
          element={<EditTicket />}
        />
        <Route path='/users' element={<CreateUser />} />
      </Routes>
    </div>
  );
}

export default App;
