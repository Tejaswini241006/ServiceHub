import os
from dotenv import load_dotenv

# Load .env before creating the app
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from app import create_app, db

app = create_app(os.environ.get("FLASK_ENV", "development"))

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    port = int(os.environ.get("PORT", 5000))
    # use_reloader=False avoids the double-start that breaks subprocess detection
    app.run(host="0.0.0.0", port=port, debug=app.config.get("DEBUG", True), use_reloader=False)
