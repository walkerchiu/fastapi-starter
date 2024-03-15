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

# Install Poetry to creating Virtual Environments.
brew install poetry

# Set up a virtual environment with Python 3.
poetry env use python3
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
uvicorn examples.main:app --reload
```
