import os
import asyncio
import random
from flask import Flask, request, jsonify
from sinch import SinchClient
from utils import boolean, get_bearer_token
from mongo import (
    create_user,
    authenticate,
    get_user_by_id,
    de_authenticate,
    store_2fa,
    verify_2fa,
    get_user_by_email,
    create_token,
    get_user_by_token,
    update_user,
)
from flask_cors import CORS, cross_origin
from flask_mailing import Mail, Message

app = Flask(__name__)
cors = CORS(app)
mail = Mail()

app.config["CORS_HEADERS"] = "Content-Type"
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT"))
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_USE_TLS"] = boolean(os.getenv("MAIL_USE_TLS"))
app.config["MAIL_USE_SSL"] = boolean(os.getenv("MAIL_USE_SSL"))
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")
mail.init_app(app)

account_sid = os.getenv("TWILIO_SID")
auth_token = os.getenv("TWILIO_TOKEN")
client = SinchClient(key_id=os.getenv("SINCH_ACCESS_KEY_ID"), project_id=os.getenv("SINCH_PROJECT_ID"), key_secret=os.getenv("SINCH_KEY_SECRET"))


def send_mail(subject, body, recipients):
    if not isinstance(recipients, list):
        recipients = [recipients]

    message = Message(subject=subject, recipients=recipients, body=body)

    asyncio.run(mail.send_message(message))
    return jsonify({"message": "Mail sent"}), 200


def send_phone_message(body, recipients):
    if not isinstance(recipients, list):
        recipients = [recipients[1:]]
    message = client.sms.batches.send(body=body, to=recipients, from_=os.getenv("SINCH_NUMBER"), delivery_report="none")
    print(f"Sending message to {recipients}: {body}")
    return jsonify({"message": "Message sent"}), 200


@app.route("/api/status", methods=["GET"])
@cross_origin()
def status():
    return jsonify({"status": "ok"}), 200


@app.route("/api/signup", methods=["POST"])
@cross_origin()
def signup():
    data = request.get_json()
    email = data.get("email", [])
    password = data.get("password", [])

    if email == [] or password == []:
        return jsonify({"error": "Email and password are required"}), 400

    _, err = create_user(email, password)
    if err:
        return jsonify({"error": err}), 409

    _, token = authenticate(email, password)
    return jsonify({"token": token, "email": email}), 201


@app.route("/api/signin", methods=["POST"])
@cross_origin()
def signin():
    data = request.get_json()

    email = data.get("email", [])
    password = data.get("password", [])
    user, token = authenticate(email=email, password=password, _create_token=False)

    if user is not None:
        return jsonify({"message": "success"}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


@app.route("/api/2fa/email", methods=["POST"])
@cross_origin()
def send_2fa_email():
    data = request.get_json()
    email = data.get("email", [])
    subject = "2FA Code"
    code = str(random.randint(100000, 999999))
    body = "Your 2FA code is " + code
    send_mail(subject, body, email)
    print(f"2FA code for {email}: {code}")
    store_2fa(email, code)
    return jsonify({"message": "2FA code sent"}), 200


@app.route("/api/2fa/verify", methods=["POST"])
@cross_origin()
def _verify_2fa():
    data = request.get_json()
    email = data.get("email", [])
    code = data.get("code", [])

    if email == [] or code == []:
        return jsonify({"error": "Email and code are required"}), 400

    if verify_2fa(email, code):
        token = create_token(email)
        return jsonify({"token": token}), 200
    else:
        return jsonify({"error": "Invalid 2FA code"}), 401


@app.route("/api/2fa/phone", methods=["POST"])
@cross_origin()
def send_2fa_phone():
    data = request.get_json()
    email = data.get("email", [])
    user = get_user_by_email(email)
    if user is None:
        return jsonify({"error": "User not found"}), 401
    phone = user.get("phone", [])
    if not phone:
        return jsonify({"error": "Phone number not found"}), 401
    code = str(random.randint(100000, 999999))
    body = "Your 2FA code is " + code
    send_phone_message(body, phone)
    print(f"2FA code for {email}: {code}")
    store_2fa(email, code)
    return jsonify({"message": "2FA code sent"}), 200


@app.route("/api/signout", methods=["POST"])
@cross_origin()
def signout():
    bearer = request.headers.get("Authorization")
    if bearer is None:
        return jsonify({"error": "No token provided"}), 401
    token = bearer.split(" ")[1]
    de_authenticate(token)
    return jsonify({"message": "User logged out"}), 200


@app.route("/api/user/me", methods=["GET"])
@cross_origin()
def refresh():
    token = get_bearer_token(request)
    user = get_user_by_token(token)
    if user is None:
        return jsonify({"error": "Invalid token"}), 401
    _dict = {"token": token, "email": user["email"]}
    try:
        _dict["phone"] = user["phone"]
        _dict["dob"] = user["dob"]
    except KeyError:
        pass

    return jsonify(_dict), 200


@app.route("/api/verify_token", methods=["POST"])
@cross_origin()
def verify_token():
    data = request.get_json()
    token = data.get("token", [])
    user, new_token = authenticate(token=token)
    if user is None:
        return jsonify({"error": "Invalid token"}), 401
    return jsonify({"token": new_token}), 200


@app.route("/api/user/<user_id>", methods=["GET"])
@cross_origin()
def get_user(user_id):
    user = get_user_by_id(user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 401
    return jsonify(user), 200


@app.route("/api/user/update", methods=["POST"])
@cross_origin()
def _update_user():
    data = request.get_json()
    phone = data.get("phone", [])
    dob = data.get("dob", [])
    gender = data.get("gender", [])

    bearer = get_bearer_token(request)
    user, token = authenticate(token=bearer, _create_token=False)
    if user is None:
        return jsonify({"error": "Invalid token"}), 401

    success = update_user(user_id=user["_id"], phone=phone, dob=dob, gender=gender)
    if not success:
        return jsonify({"error": "Failed to update user"}), 500

    return (
        jsonify(
            {
                "email": user["email"],
                "phone": phone,
                "dob": dob,
                "token": bearer,
                "gender": gender,
            }
        ),
        200,
    )


if __name__ == "__main__":
    app.run(debug=True)
