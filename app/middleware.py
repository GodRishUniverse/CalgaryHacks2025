from flask import request, abort, current_app
from functools import wraps


def api_key_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            abort(401, "Missing Authorization header")

        try:
            scheme, key = auth_header.split()
            if scheme.lower() != "bearer":
                abort(401, "Invalid authentication scheme")
        except ValueError:
            abort(401, "Invalid Authorization header format")

        if key not in current_app.config["API_KEYS"]:
            abort(403, "Invalid API key")

        return f(*args, **kwargs)

    return decorated_function
