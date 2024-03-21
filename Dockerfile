###########
# BUILDER #
###########

# Pull official base image
FROM python:3.12-slim AS builder

# Set the working directory
WORKDIR /usr/src

# Install pip, pipx, and poetry
RUN pip install --upgrade pip \
    && pip install pipx \
    && pipx install poetry

# Copy the poetry.lock and pyproject.toml files into the container
COPY pyproject.toml poetry.lock ./

# Add poetry's bin directory to PATH
ENV PATH="/root/.local/bin:${PATH}"

# Export dependencies to a requirements.txt file
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

# Install dependencies as wheels
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/wheels -r requirements.txt


#########
# FINAL #
#########

# Build the final image
FROM builder AS final

# Set the working directory
WORKDIR /usr/src

# Set environment variables to configure Python's behavior
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copy the built wheels from the builder stage
COPY --from=builder /usr/src/wheels /wheels
COPY --from=builder /usr/src/requirements.txt .

# Install the dependencies from the wheels
RUN pip install --no-cache /wheels/*

# Copy the application code
COPY ./app ./app

# Expose port 8000
EXPOSE 8000
