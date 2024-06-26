from pymongo.mongo_client import MongoClient

from flask import Flask


from src.api import api

app = Flask(__name__)
app.register_blueprint(api)


if __name__ == "__main__":
    app.run()
