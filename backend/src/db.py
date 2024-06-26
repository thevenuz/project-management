from pymongo.mongo_client import MongoClient
from datetime import datetime
import json


__all__ = ("DB",)


class DB:
    """DB class to interact with the mongodb."""

    def __init__(self) -> None:
        """Initialize the DB class."""
        self.uri = self.__get_db_uri()
        self.client = MongoClient(self.uri)
        self.db = self.client["project-management"]
        self.employee = self.db["employee"]
        self.manager = self.db["manager"]
        self.project = self.db["project"]
        self.task = self.db["task"]
        self.ticket = self.db["ticket"]
        self.admin = self.db["admindb"]

    def __get_db_uri(self) -> str:
        """"""
        try:
            with open("data.json", "r") as f:
                data = json.load(f)
                return data.get("uri", "")

        except Exception as e:
            raise e

    def get_employees(self) -> dict:
        """Get employee details by employee_id."""
        try:
            emps = self.employee.find()

            list_emps = []
            for emp in emps:
                list_emps.append(self.__format_employee(emp))

            return list_emps

        except Exception as e:
            raise e

    def get_employee(self, employee_id: str) -> dict:
        """Get employee details by employee_id."""
        try:
            emp = self.employee.find_one({"employee_id": employee_id})
            return self.__format_employee(emp)

        except Exception as e:
            raise e

    def create_employee(self, employee: dict) -> dict:
        """Create employee details."""
        try:
            self.employee.insert_one(employee)
            return True

        except Exception as e:
            raise e

    def get_managers(self) -> dict:
        """Get employee details by employee_id."""
        try:
            mgrs = self.manager.find()

            managers = []
            for mgr in mgrs:
                managers.append(self.__format_manager(mgr))

            return managers

        except Exception as e:
            raise e

    def get_manager(self, manager_id: str) -> dict:
        """Get employee details by employee_id."""
        try:
            mgr = self.manager.find_one({"manager_id": manager_id})
            return self.__format_manager(mgr)

        except Exception as e:
            raise e

    def get_admins(self) -> dict:
        """Get admin db details."""
        try:
            admins = self.admin.find()

            list_admins = []
            for admin in admins:
                list_admins.append(self.__format_admin(admin))

            return list_admins

        except Exception as e:
            raise e

    def get_projects_by_employee(self, employee: str) -> dict:
        """Get project details by employee_id."""
        try:
            projects = self.project.find({"employees": employee})

            list_projects = []
            for project in projects:
                list_projects.append(self.__format_project(project))

            return {"isSuccess": True, "data": list_projects}

        except Exception as e:
            raise e

    def get_projects_by_manager(self, manager: str) -> dict:
        """Get project details by manager_id."""
        try:
            projects = self.project.find({"manager": manager})

            list_projects = []
            for project in projects:
                list_projects.append(self.__format_project(project))

            return {"isSuccess": True, "data": list_projects}

        except Exception as e:
            raise e

    def create_project(self, project: dict) -> dict:
        """Create project details."""
        try:
            result = self.project.insert_one(project)
            return {"isSuccess": True, "data": self.__format_project(project)}

        except Exception as e:
            raise e

    def update_project(self, project_id: str, project: dict) -> dict:
        """Update project details by project_id."""
        try:
            project_data = self.project.find_one({"project_id": project_id})

            project["tasks"] = project_data["tasks"]

            if project_data:
                self.project.update_one(
                    {"project_id": project_id}, {"$set": project}, upsert=False
                )
                return {
                    "isSuccess": True,
                    "data": self.__format_project(project),
                }

            return {
                "isSuccess": False,
                "error": "Project not found.",
            }

        except Exception as e:
            raise e

    def get_projects(self) -> dict:
        """Get project details."""
        try:
            projects = self.project.find()

            list_projects = []
            for project in projects:
                list_projects.append(self.__format_project(project))

            return {"isSuccess": True, "data": list_projects}

        except Exception as e:
            raise e

    def get_project(self, project_id: str) -> dict:
        """Get project details by project_id."""
        try:
            project = self.project.find_one({"project_id": project_id})

            return {"isSuccess": True, "data": self.__format_project(project)}

        except Exception as e:
            raise e

    def delete_project(self, project_id: str) -> dict:
        """Delete project details by project_id."""
        try:
            project = self.project.find_one({"project_id": project_id})

            if project:
                self.project.delete_one({"project_id": project_id})
                return {
                    "isSuccess": True,
                    "data": "Project deleted successfully.",
                }

            return {
                "isSuccess": False,
                "error": "Project not found.",
            }

        except Exception as e:
            raise e

    def delete_task(self, task_id: str) -> dict:
        """Delete task details by task_id."""
        try:
            task = self.task.find_one({"task_id": task_id})

            if task:
                project = self.project.find_one({"tasks.task_id": task_id})
                res = self.project.update_one(
                    {"_id": project["_id"]},
                    {"$pull": {"tasks": {"task_id": task_id}}},
                )

                tickets = task["tickets"]
                for ticket in tickets:
                    self.ticket.delete_one({"ticket_id": ticket["ticket_id"]})

                if res.modified_count > 0:
                    self.task.delete_one({"task_id": task_id})
                    return {
                        "isSuccess": True,
                        "data": "Task deleted successfully.",
                    }

                return {
                    "isSuccess": False,
                    "error": "Task not linked to project.",
                }

            return {
                "isSuccess": False,
                "error": "Task not found.",
            }

        except Exception as e:
            raise e

    def create_task(self, pid: int, task: dict) -> dict:
        """Create task details."""
        try:
            result = self.task.insert_one(task)

            if result:
                project = self.project.find_one({"project_id": pid})
                proj_task_data = {
                    "task_id": task["task_id"],
                    "task_title": task["task_title"],
                }
                project["tasks"].append(proj_task_data)
                self.project.update_one(
                    {"project_id": pid}, {"$set": project}, upsert=False
                )
            return {"isSuccess": True, "data": self.__format_task(task)}

        except Exception as e:
            raise e

    def get_tasks(self) -> dict:
        """Get task details."""

        try:

            tasks = self.task.find()

            list_tasks = []
            for task in tasks:
                list_tasks.append(self.__format_task(task))

            return list_tasks

        except Exception as e:
            raise e

    def get_task(self, task_id: str) -> dict:
        """Get task details by task_id."""
        try:
            task = self.task.find_one({"task_id": task_id})

            if task:
                return {
                    "isSuccess": True,
                    "data": self.__format_task(task),
                }

            return {
                "isSuccess": False,
                "error": "Task not found.",
            }

        except Exception as e:
            raise e

    def update_task(self, project_id: str, task_id: str, task: dict) -> dict:
        """Update task details by task_id."""
        try:
            task_data = self.task.find_one({"task_id": task_id})
            task["tickets"] = task_data["tickets"]

            if task_data:
                self.task.update_one({"task_id": task_id}, {"$set": task}, upsert=False)
                project = self.project.find_one({"project_id": project_id})
                if project:
                    for idx, t in enumerate(project["tasks"]):
                        if t["task_id"] == task_id:
                            project["tasks"][idx] = {
                                "task_id": task["task_id"],
                                "task_title": task["task_title"],
                            }
                            break

                    self.project.update_one(
                        {"project_id": project_id}, {"$set": project}, upsert=False
                    )
                return {
                    "isSuccess": True,
                    "data": self.__format_task(task),
                }

            return {"isSuccess": False, "error": "Task not found."}

        except Exception as e:
            raise e

    def get_tickets(self) -> dict:
        """Get ticket details."""

        try:

            tickets = self.ticket.find()

            list_tickets = []
            for ticket in tickets:
                list_tickets.append(self.__format_ticket(ticket))

            return list_tickets

        except Exception as e:
            raise e

    def get_ticket(self, ticket_id: str) -> dict:
        """Get ticket details by ticket_id."""
        try:
            ticket = self.ticket.find_one({"ticket_id": ticket_id})
            return {
                "isSuccess": True,
                "data": self.__format_ticket(ticket),
            }

        except Exception as e:
            raise e

    def create_ticket(self, task_id: int, ticket: dict) -> dict:
        """Create ticket details."""
        try:
            result = self.ticket.insert_one(ticket)

            if result:
                task = self.task.find_one({"task_id": task_id})
                ticket_data = {
                    "ticket_id": ticket["ticket_id"],
                    "ticket_title": ticket["ticket_title"],
                }
                task["tickets"].append(ticket_data)
                self.task.update_one({"task_id": task_id}, {"$set": task}, upsert=False)

            return {"isSuccess": True, "data": self.__format_ticket(ticket)}

        except Exception as e:
            raise e

    def update_ticket(self, task_id, ticket_id: int, ticket: dict) -> dict:
        """Update ticket details by ticket_id."""
        try:
            ticket_data = self.ticket.find_one({"ticket_id": ticket_id})
            ticket["comments"] = ticket_data["comments"]
            ticket["created_date"] = ticket_data["created_date"]

            if ticket_data:
                self.ticket.update_one(
                    {"ticket_id": ticket_id}, {"$set": ticket}, upsert=False
                )
                task = self.task.find_one({"task_id": task_id})
                if task:
                    for idx, t in enumerate(task["tickets"]):
                        if t["ticket_id"] == ticket_id:
                            task["tickets"][idx] = {
                                "ticket_id": ticket["ticket_id"],
                                "ticket_title": ticket["ticket_title"],
                            }
                            break

                    self.task.update_one(
                        {"task_id": task_id}, {"$set": task}, upsert=False
                    )
                return {
                    "isSuccess": True,
                    "data": self.__format_ticket(ticket),
                }

            return {"isSuccess": False, "error": "Ticket not found."}

        except Exception as e:
            raise e

    def update_comment(self, ticket_id: str, comment_id: str, comment: dict) -> dict:
        """Update comment details by comment_id."""
        try:
            ticket = self.ticket.find_one({"ticket_id": ticket_id})

            if ticket:
                comments = ticket["comments"]

                if not comments:
                    return {
                        "isSuccess": False,
                        "error": "No comments found.",
                    }

                for idx, com in enumerate(comments):
                    if com["comment_id"] == comment_id:
                        comments[idx]["comment_description"] = comment.get(
                            "comment_description", ""
                        )
                        break

                ticket["comments"] = comments
                self.ticket.update_one({"ticket_id": ticket_id}, {"$set": ticket})
                return {
                    "isSuccess": True,
                    "data": self.__format_ticket(ticket),
                }

        except Exception as e:
            raise e

    def authenticate(self, username: str, password: str) -> dict:
        try:
            admin = self.admin.find_one({"username": username, "password": password})
            if admin:
                return {
                    "isSuccess": True,
                    "data": {
                        "isAuthenticated": True,
                        "role": "admin",
                        "username": username,
                    },
                }

            employee = self.employee.find_one(
                {"username": username, "password": password}
            )
            if employee:
                return {
                    "isSuccess": True,
                    "data": {
                        "isAuthenticated": True,
                        "role": "employee",
                        "username": username,
                    },
                }

            manager = self.manager.find_one(
                {"username": username, "password": password}
            )
            if manager:
                return {
                    "isSuccess": True,
                    "data": {
                        "isAuthenticated": True,
                        "role": "manager",
                        "username": username,
                    },
                }

        except Exception as e:
            raise e

    def get_latest_project_id(self) -> int:
        """Get the latest project id."""
        try:
            project = self.project.find().sort({"_id": -1})
            for p in project:
                id = p["project_id"].split("_")[1]
                return id

            return 0

        except Exception as e:
            raise e

    def get_latest_task_id(self) -> int:
        """Get the latest task id."""
        try:
            task = self.task.find().sort({"_id": -1})
            for t in task:
                id = t["task_id"].split("_")[1]
                return id

            return 0

        except Exception as e:
            raise e

    def delete_ticket(self, ticket_id: str) -> dict:
        """Delete ticket details by ticket_id."""
        try:
            ticket = self.ticket.find_one({"ticket_id": ticket_id})

            if ticket:
                task = self.task.find_one({"tickets.ticket_id": ticket_id})
                res = self.task.update_one(
                    {"_id": task["_id"]},
                    {"$pull": {"tickets": {"ticket_id": ticket_id}}},
                )
                if res.modified_count > 0:
                    self.ticket.delete_one({"ticket_id": ticket_id})
                    return {
                        "isSuccess": True,
                        "data": "Ticket deleted successfully.",
                    }

                return {
                    "isSuccess": False,
                    "error": "Ticket not linked to task.",
                }

            return {"isSuccess": False, "error": "Ticket not found."}

        except Exception as e:
            raise e

    def get_latest_ticket_id(self):
        """Get the latest ticket id."""
        try:
            ticket = self.ticket.find().sort({"_id": -1})
            for t in ticket:
                id = t["ticket_id"].split("_")[1]
                return id

            return 0
        except Exception as e:
            raise e

    def create_comment(self, ticket_id: str, comment: dict) -> dict:
        """Create comment details."""
        try:
            ticket = self.ticket.find_one({"ticket_id": ticket_id})
            if ticket:
                ticket["comments"].append(comment)
                self.ticket.update_one({"ticket_id": ticket_id}, {"$set": ticket})
                return {
                    "isSuccess": True,
                    "data": self.__format_ticket(ticket),
                }

            return {
                "isSuccess": False,
                "error": "Ticket not found.",
            }

        except Exception as e:
            raise e

    def delete_comment(self, ticket_id: str, comment_id: str) -> dict:
        """Delete comment details."""
        try:
            ticket = self.ticket.find_one({"ticket_id": ticket_id})
            if ticket:
                comments = ticket["comments"]

                if not comments:
                    return {
                        "isSuccess": False,
                        "error": "No comments found.",
                    }

                for idx, comment in enumerate(comments):
                    if comment["comment_id"] == comment_id:
                        del comments[idx]
                        break

                ticket["comments"] = comments
                self.ticket.update_one({"ticket_id": ticket_id}, {"$set": ticket})
                return {
                    "isSuccess": True,
                    "data": self.__format_ticket(ticket),
                }

            return {
                "isSuccess": False,
                "error": "Ticket not found.",
            }

        except Exception as e:
            return {"isSuccess": False, "error": str(e)}

    def get_latest_manager_id(self):
        """Get the latest ticket id."""
        try:
            manager = self.manager.find().sort({"_id": -1})
            for m in manager:
                id = m["manager_id"].split("_")[1]
                return id

            return 0

        except Exception as e:
            raise e

    def get_latest_employee_id(self):
        """Get the latest ticket id."""
        try:
            employee = self.employee.find().sort({"_id": -1})
            for e in employee:
                id = e["employee_id"].split("_")[1]
                return id

            return 0

        except Exception as e:
            raise e

    def get_latest_comment_id(self, ticket_id: str):
        """Get the latest ticket id."""
        try:
            ticket = self.ticket.find_one({"ticket_id": ticket_id}, {"comments": 1})
            if not ticket or "comments" not in ticket or not ticket["comments"]:
                return 0

            last_comment = ticket["comments"][-1]
            return last_comment.get("comment_id").split("_")[1]

        except Exception as e:
            raise e

    def get_latest_user_id(self, role: str):
        """"""
        try:

            if role == "manager":
                return self.get_latest_manager_id()

            elif role == "employee":
                return self.get_latest_employee_id()

            return 0

        except Exception as e:
            raise e

    def create_user(self, user: dict) -> dict:
        """Create user details."""
        try:
            new_id = int(self.get_latest_user_id(user.get("role", ""))) + 1

            if user.get("role", "") == "manager":
                user["manager_id"] = f"mgr_{new_id:03d}"
                if "name" in user:
                    del user["name"]

                self.manager.insert_one(user)

            elif user.get("role", "") == "employee":
                user["employee_id"] = f"emp_{new_id:03d}"
                user["employee_name"] = user["name"]
                if "name" in user:
                    del user["name"]

                self.employee.insert_one(user)

            elif user.get("role", "") == "admin":

                if "name" in user:
                    del user["name"]

                self.admin.insert_one(user)

            return {"isSuccess": True, "data": True}

        except Exception as e:
            raise e

    def __format_admin(self, admin: dict) -> dict:
        try:
            return {
                "admin_id": admin.get("admin_id", None),
                "username": admin.get("username", None),
                "password": admin.get("password", None),
                "role": admin.get("role", None),
            }

        except Exception as e:
            raise e

    def __format_ticket(self, ticket: dict) -> dict:
        try:
            return {
                "ticket_id": ticket.get("ticket_id", None),
                "ticket_title": ticket.get("ticket_title", None),
                "ticket_description": ticket.get("ticket_description", None),
                "ticket_type": ticket.get("ticket_type", None),
                "created_by": ticket.get("created_by", None),
                "assigned_user": ticket.get("assigned_user", None),
                "ticket_status": ticket.get("ticket_status", None),
                "created_date": ticket.get("created_date", None),
                "last_updated_date": ticket.get("last_updated_date", None),
                "closed_date": ticket.get("closed_date", None),
                "comments": ticket.get("comments", []),
            }

        except Exception as e:
            raise e

    def __format_task(self, task: dict) -> dict:
        try:
            return {
                "task_id": task.get("task_id", None),
                "task_title": task.get("task_title", None),
                "task_description": task.get("task_description", None),
                "assigned_team": task.get("assigned_team", None),
                "task_status": task.get("task_status", None),
                "tickets": task.get("tickets", None),
                "start_date": task.get("start_date", datetime.min).strftime("%Y-%m-%d"),
                "expected_finish_date": task.get(
                    "expected_finish_date", datetime.min
                ).strftime("%Y-%m-%d"),
                "employees": task.get("employees", None),
            }

        except Exception as e:
            raise e

    def __format_project(self, project: dict) -> dict:
        """Format project details."""
        try:
            return {
                "project_id": project.get("project_id", None),
                "project_title": project.get("project_title", None),
                "project_description": project.get("project_description", None),
                "start_date": project.get("start_date", datetime.min).strftime(
                    "%Y-%m-%d"
                ),
                "project_status": project.get("project_status", None),
                "expected_finish_date": project.get(
                    "expected_finish_date", datetime.min
                ).strftime("%Y-%m-%d"),
                "budget": str(project.get("budget", "")),
                "created_by": project.get("created_by", None),
                "employees": project.get("employees", None),
                "tasks": project.get("tasks", None),
                "manager": project.get("manager", None),
            }

        except Exception as e:
            raise e

    def __format_manager(self, manager: dict) -> dict:
        try:
            return {
                "manager_id": manager.get("manager_id", None),
                "username": manager.get("username", None),
                "password": manager.get("password", None),
                "role": manager.get("role", None),
            }

        except Exception as e:
            raise e

    def __format_employee(self, emp: dict) -> dict:
        try:
            return {
                "employee_id": emp.get("employee_id", None),
                "employee_name": emp.get("employee_name", None),
                "username": emp.get("username", None),
                "password": emp.get("password", None),
                "role": emp.get("role", None),
            }

        except Exception as e:
            raise e

    def __format_date(self, date) -> str:
        """"""
        try:
            if date is None:
                date_time = datetime.strptime(date, "%a, %d %b %Y %H:%M:%S %Z")
                return date_time.date()

            else:
                return None
        except Exception as e:
            raise e
