import datetime
import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import bcrypt
import uuid

load_dotenv()
uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")

client = MongoClient(uri)

db = client[db_name]

Users = db["users"]
Tokens = db["tokens"]
_2fa = db["2fa"]

try:
    client.admin.command("ping")
    print("Connected to MongoDB")
except Exception as e:
    print(e)


def hash_password(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_password


def create_user(email, password):
    hashed_password = hash_password(password)
    user_id = uuid.uuid4().hex
    existing_user = get_user_by_email(email)
    if existing_user:
        return None, "User already exists"
    user = {"_id": user_id, "email": email, "password": hashed_password}
    Users.insert_one(user)
    return user, None


def get_user_by_email(email):
    user = Users.find_one({"email": email})
    if user:
        return user
    return None


def check_hash(password, hashed_password):
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password)


def authenticate(email=None, password=None, token=None, _create_token=True):
    if token is not None:
        token = Tokens.find_one({"token": token})
        if token:
            user = Users.find_one({"_id": token["user_id"]})
            if user:
                if _create_token:
                    new_token = uuid.uuid4().hex
                    Tokens.update_one(
                        {"token": token["token"]}, {"$set": {"token": new_token}}
                    )
                    return user, new_token
                else:
                    return user, None
        return None, None

    if email is None or password is None:
        return None, None

    user = Users.find_one({"email": email})
    if user and check_hash(password, user["password"]):
        if _create_token:
            token = create_token(email)
            return user, token
        else:
            return user, None

    return None, None


def create_token(email):
    user = Users.find_one({"email": email})
    if user:
        Tokens.delete_many({"user_id": user["_id"]})
        token = uuid.uuid4().hex
        Tokens.insert_one({"token": token, "user_id": user["_id"]})
        return token
    return None


def store_2fa(email, secret):
    _2fa.delete_many({"email": email})
    validity_period = 60 # 1 minute
    expiry = datetime.datetime.now() + datetime.timedelta(seconds=validity_period)
    _2fa.insert_one({"email": email, "secret": secret, "expiry": expiry})
    return True


def verify_2fa(email, code):
    secret = _2fa.find_one({"email": email})
    print(f"2FA code for {email}: {code}")
    valifity_period = secret["expiry"]
    if secret and datetime.datetime.now() < valifity_period:
        validity = secret["secret"] == code
        if validity:
            _2fa.delete_one({"email": email})
        return validity
    return False


def de_authenticate(token):
    Tokens.delete_one({"token": token})
    return True


def get_user_by_id(user_id):
    user = Users.find_one({"_id": user_id})
    if user:
        return user
    return None

def get_user_by_token(token):
    token = Tokens.find_one({"token": token})
    if token:
        _id = token["user_id"]
        user = get_user_by_id(_id)
        if user:
            return user
    return None


def update_user(user_id, phone, dob, gender):
    try:
        Users.find_one_and_update(
            {"_id": user_id},
            {"$set": {"phone": phone or None, "dob" or None: dob or None, "gender": gender or None}},
        )
        return True
    except Exception as err:
        print(err)
        return False
