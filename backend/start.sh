#!/bin/bash

# Initialize the database
python __init__.py

# Start the server
uvicorn main:app --host 0.0.0.0 --port $PORT
