# FastAPI Starter

## Get Started For IDE

### Prerequisites

- git >= 2.39.3
- python >= 3.12.1

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

# Automatically creates and manages a virtualenv for your projects.
brew install pipenv
# Create a new project using Python 3.12.
pipenv --python 3.12
# Install all dependencies for a project (including dev).
pipenv install --dev
# Scan your dependency graph for known security vulnerabilities!
pipenv check
```

### Run Application

```sh
# Generate a set of requirements out of it with the default dependencies.
pipenv requirements > requirements.txt

# To activate this project's virtualenv, run "pipenv shell".
# Alternatively, run a command inside the virtualenv with "pipenv run".
pipenv shell

# Run the application
uvicorn examples.main:app --reload
```
