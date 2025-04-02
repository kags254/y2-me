# YELLOW MAX POOL Trading Bot - Deployment Guide

## Required Files

To deploy your trading bot, you'll need these files:

```
yellow_max_pool/
├── app.py                # Flask app configuration
├── main.py               # Entry point
├── models.py             # Database models
├── routes.py             # API routes
├── trading_bot.py        # Bot logic
├── requirements.txt      # Dependencies (automatically created by Replit)
├── static/               # Frontend assets
│   ├── css/
│   ├── js/
│   └── images/
├── templates/            # HTML templates
│   └── index.html
└── utils/                # Utility modules
    ├── backtester.py
    ├── digit_analysis.py
    └── ml_models.py
```

## Dependencies

Make sure your deployment environment includes these packages:

```
flask==2.3.3
flask-login==0.6.2
flask-sqlalchemy==3.0.5
gunicorn==23.0.0
numpy==1.25.2
psycopg2-binary==2.9.7
requests==2.31.0
routes==2.5.1
scikit-learn==1.3.0
sqlalchemy==2.0.20
tensorflow==2.13.0
textblob==0.17.1
websockets==11.0.3
email-validator==2.0.0
```

## Deployment Instructions

### 1. Replit Deployment

1. Click the "Deploy" button in the Replit interface
2. Follow the prompts to configure your deployment
3. No additional setup required as Replit handles the configuration

### 2. PythonAnywhere

1. Create a new account at [PythonAnywhere](https://www.pythonanywhere.com/)
2. Upload your files via the Files section or git clone
3. Create a new web app (choose Flask)
4. Set WSGI configuration to point to your `main:app`
5. Install dependencies via the Bash console using pip
6. Configure a PostgreSQL database if needed

### 3. Render

1. Create an account at [Render](https://render.com/)
2. Connect to GitHub or upload your code
3. Create a new Web Service
4. Set the build command: `pip install -r requirements.txt`
5. Set the start command: `gunicorn main:app`
6. Add environment variables as needed

### 4. Railway

1. Create an account at [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Deploy from the repository
4. Add a PostgreSQL database from the Railway dashboard
5. Set environment variables as needed

### 5. Heroku

1. Create a new app on [Heroku](https://www.heroku.com/)
2. Install the Heroku CLI
3. Create a `Procfile` with: `web: gunicorn main:app`
4. Push your code using Git or GitHub integration
5. Add a PostgreSQL add-on if needed
6. Configure environment variables in the Settings tab

## Environment Variables

Make sure to set these environment variables in your deployment:

- `DATABASE_URL`: Your PostgreSQL connection string
- `SESSION_SECRET`: A random string for Flask's secure sessions
- `PORT`: Set to 5000 or let the platform decide
- API credentials for the trading platform

## Database Setup

In most cases, you'll need to manually run database migrations or create tables on first deploy. Connect to your database and run:

```python
from app import app, db
with app.app_context():
    db.create_all()
```

## Important Notes

1. Make sure your Flask app binds to host `0.0.0.0` to accept external connections
2. Most platforms expect your application to respect the `PORT` environment variable
3. Use PostgreSQL for persistent storage rather than SQLite for production
4. Set debug mode to False in production
5. Ensure your websocket connections handle disconnects gracefully