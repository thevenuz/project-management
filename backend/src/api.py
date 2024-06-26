from flask import Blueprint, request
from flask_cors import CORS, cross_origin

from datetime import datetime

from src import DB

api = Blueprint("api", __name__)
cors = CORS(api)


db = DB()


# region auth
@api.route("/prm/auth/authenticate", methods=["POST"])
@cross_origin(origins="*")
def authenticate():
    """API method to authenticate user."""
    try:
        print("triggered")
        content = request.json
        username = content.get("username", None)
        password = content.get("password", None)

        if username is None:
            return {"isSuccess": False, "error": "Username is required."}

        if password is None:
            return {"isSuccess": False, "error": "Password is required."}

        return db.authenticate(username, password)

    except Exception as e:
        raise e


# endregion


# region projects
@api.route("/prm/projects", methods=["GET"])
@cross_origin(origins="*")
def get_projects():
    """API method to get all projects."""

    return db.get_projects()


@api.route("/prm/projects/<id>", methods=["GET"])
@cross_origin(origins="*")
def get_project(id):
    """API method to get project by id."""

    return db.get_project(id)


@api.route("/prm/project/create", methods=["POST"])
@cross_origin(origins="*")
def create_project():
    """API method to create project."""

    content = request.json
    new_id = int(db.get_latest_project_id()) + 1
    content["project_id"] = f"p_{new_id:03d}"
    content["project_status"] = "Active"
    content["start_date"] = datetime.strptime(content["start_date"], "%Y-%m-%d")
    content["expected_finish_date"] = datetime.strptime(
        content["expected_finish_date"], "%Y-%m-%d"
    )
    return db.create_project(content)


@api.route("/prm/project/<id>", methods=["PUT"])
@cross_origin(origins="*")
def update_project(id):
    """API method to update project by id."""

    content = request.json
    content["start_date"] = datetime.strptime(content["start_date"], "%Y-%m-%d")
    content["expected_finish_date"] = datetime.strptime(
        content["expected_finish_date"], "%Y-%m-%d"
    )
    return db.update_project(id, content)


@api.route("/prm/project/<id>", methods=["DELETE"])
@cross_origin(origins="*")
def delete_project(id):
    """API method to delete project by id."""

    # TODO: delete all tasks, tickets and comments associated with this project
    return db.delete_project(id)


@api.route("/prm/projects/manager/<manager>", methods=["GET"])
@cross_origin(origins="*")
def get_projects_by_manager(manager):
    """API method to get all projects by manager."""

    return db.get_projects_by_manager(manager)


@api.route("/prm/projects/employee/<employee>", methods=["GET"])
@cross_origin(origins="*")
def get_projects_by_employee(employee):
    """API method to get all projects by employee."""

    return db.get_projects_by_employee(employee)


# endregion


# region tasks
@api.route("/prm/tasks/<id>", methods=["GET"])
@cross_origin(origins="*")
def get_task(id):
    """API method to get task by id."""

    return db.get_task(id)


@api.route("/prm/tasks/<id>", methods=["DELETE"])
@cross_origin(origins="*")
def delete_task(id):
    """API method to delete task by id."""

    # TODO: delete all tickets and comments associated with this task

    return db.delete_task(id)


@api.route("/prm/<pid>/tasks/new", methods=["POST"])
@cross_origin(origins="*")
def create_task(pid):
    """API method to create task."""

    content = request.json
    new_id = int(db.get_latest_task_id()) + 1
    content["task_id"] = f"tsk_{new_id:03d}"
    content["task_status"] = "Active"

    content["start_date"] = datetime.strptime(content["start_date"], "%Y-%m-%d")
    content["expected_finish_date"] = datetime.strptime(
        content["expected_finish_date"], "%Y-%m-%d"
    )

    return db.create_task(pid, content)


@api.route("/prm/projects/<pid>/tasks/<tskid>", methods=["PUT"])
@cross_origin(origins="*")
def update_task(pid, tskid):
    """API method to update task by id."""

    content = request.json

    return db.update_task(pid, tskid, content)


# endregion


# region tickets
@api.route("/prm/tickets/<id>", methods=["GET"])
@cross_origin(origins="*")
def get_ticket(id):
    """API method to get ticket by id."""

    return db.get_ticket(id)


@api.route("/prm/tickets/<id>", methods=["DELETE"])
@cross_origin(origins="*")
def delete_ticket(id):
    """API method to delete ticket by id."""

    return db.delete_ticket(id)


@api.route("/prm/tasks/<tskid>/ticket/new", methods=["POST"])
@cross_origin(origins="*")
def create_ticket(tskid):
    """API method to create ticket."""

    content = request.json
    new_id = int(db.get_latest_ticket_id()) + 1
    content["ticket_id"] = f"t_{new_id:03d}"
    content["ticket_status"] = "Open"
    content["created_date"] = datetime.now()
    content["last_updated_date"] = datetime.now()

    return db.create_ticket(tskid, content)


@api.route("/prm/tickets/<tid>/comments", methods=["POST"])
@cross_origin(origins="*")
def create_comment(tid):
    """API method to create comment."""

    content = request.json
    new_id = int(db.get_latest_comment_id(tid)) + 1
    content["comment_id"] = f"com_{new_id:03d}"
    content["created_date"] = datetime.now()

    return db.create_comment(tid, content)


@api.route("/prm/tickets/<tid>/comments/<cid>", methods=["DELETE"])
@cross_origin(origins="*")
def delete_comment(tid, cid):
    """API method to delete comment by id."""

    return db.delete_comment(tid, cid)


@api.route("/prm/tasks/<tskid>/tickets/<tid>", methods=["PUT"])
@cross_origin(origins="*")
def update_ticket(tskid, tid):
    """API method to update ticket by id."""

    content = request.json
    content["last_updated_date"] = datetime.now()

    if content.get("ticket_status", None) == "closed":
        content["closed_date"] = datetime.now()

    return db.update_ticket(tskid, tid, content)


@api.route("/prm/tickets/<tid>/comments/<cid>", methods=["PUT"])
@cross_origin(origins="*")
def update_comment(tid, cid):
    """API method to update comment by id."""

    content = request.json

    return db.update_comment(tid, cid, content)


# endregion


@api.route("/prm/employees", methods=["GET"])
def get_employees():
    """API method to get all employees."""

    return db.get_employees()


@api.route("/prm/managers", methods=["GET"])
@cross_origin(origins="*")
def get_managers():
    """API method to get all managers."""

    return db.get_managers()


@api.route("/prm/users", methods=["POST"])
@cross_origin(origins="*")
def create_user():
    """API method to create user."""

    content = request.json

    return db.create_user(content)
