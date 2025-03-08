#!/bin/bash

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo "Failed to install pnpm. Please install it manually: https://pnpm.io/installation"
        exit 1
    fi
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env with your Google Cloud settings"
fi

echo "Setup complete! You can now build and run the server with:"
echo "pnpm build"
echo "pnpm start"
