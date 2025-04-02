# Dependencies for YELLOW MAX POOL Trading Bot

## Required Python Packages

```
flask>=2.2.0
flask-login>=0.6.2
flask-sqlalchemy>=3.0.0
gunicorn>=20.1.0
numpy>=1.23.0
psycopg2-binary>=2.9.5
requests>=2.28.0
routes>=2.5.1
scikit-learn>=1.1.0
sqlalchemy>=2.0.0
tensorflow>=2.10.0
textblob>=0.17.0
websockets>=10.4.0
email-validator>=1.3.0
```

## Installation Instructions

When creating a new environment for this project, you can install the required packages using:

```bash
# Using pip
pip install flask flask-login flask-sqlalchemy gunicorn numpy psycopg2-binary requests routes scikit-learn sqlalchemy tensorflow textblob websockets email-validator

# Or using requirements file (after exporting the above list to requirements.txt)
pip install -r requirements.txt
```

## Development Dependencies (optional)

```
pytest>=7.0.0
black>=22.0.0
flake8>=5.0.0
isort>=5.10.0
```

## JavaScript Dependencies

The frontend uses the following libraries (included via CDN):
- Chart.js
- Bootstrap
- jQuery
- Font Awesome