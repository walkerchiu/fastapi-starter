# FastAPI Starter

## Get Started For IDE

### Prerequisites

- git >= 2.39.3
- python >= 3.12.1
- npm >= 10.2.4
- node >= 21.6.2

### Setting Up the Environment for Development

Homebrew

```sh
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew update
```

Coding Style Standard

```sh
# The uncompromising Python code formatter.
brew install black
```

Recommended Setting for VS Code

```sh
# IntelliSense (Pylance), Linting, Debugging (multi-threaded, remote), Jupyter Notebooks, code formatting, refactoring, unit tests, and more.
ext install ms-python.python

# Markdown linting and style checking for Visual Studio Code
ext install markdownlint

# Visual Studio Code extension to prettify markdown tables.
ext install markdown-table-prettify
```

Virtual Environments

```sh
# Download Repository
git clone [repository]
cd [repository]

# Install Poetry to creating Virtual Environments.
brew install poetry

# Set up a virtual environment with Python 3.
poetry env use python3
```

Pre Commit

```sh
# Install pre-commit to manage git hooks
brew install pre-commit

# Install the git hook scripts.
pre-commit install

# Run against all the files.
pre-commit run --all-files
```

Git Commit Message

```sh
# commitlint
npm install
npx husky init
```

### Install Docker

```sh
# Docker
brew install docker docker-compose
open /Applications/Docker.app
```

### Customize the Settings

```sh
# Create custom setting of env
cp .env.example .env
vi .env

# Create custom setting of docker-compose
cp docker-compose.example.yml docker-compose.local.yml
vi docker-compose.local.yml
```

### Run Application

```sh
# Export the project dependencies to a requirements.txt file without including hashes
poetry export -f requirements.txt --output requirements.txt --without-hashes

# Install the project dependencies
poetry install

# Activate the Poetry virtual environment
poetry shell

# Run the application
uvicorn app.main:app --reload
uvicorn examples.main:app --reload
```

## Docs

### APP

1. Swagger UI
<http://localhost:8000/api/v1/docs>
2. Redoc
<http://localhost:8000/api/v1/redocs>
3. OpenAPI
<http://localhost:8000/api/v1/openapi>

### Example

1. Swagger UI
<http://localhost:8000/docs>
2. Redoc
<http://localhost:8000/redocs>
3. OpenAPI
<http://localhost:8000/openapi>
