def boolean(value):
    value = value.lower()
    if value == "true":
        return True
    elif value == "false":
        return False
    else:
        return False


def get_bearer_token(request):
    bearer = request.headers.get("Authorization")
    if bearer is None:
        return None
    return bearer.split(" ")[1]