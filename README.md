# Nano Banana Photo Editor

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

An AI-powered image editing application that uses Google's Gemini model to make changes to images based on text prompts. This project was built with React, Vite, and TypeScript.

## Features

*   Upload an image from your local machine.
*   Provide a text prompt to describe the desired edits.
*   (Optional) Use a masking tool to specify the exact area for the AI to edit.
*   Generate a new image with the AI-powered changes.

---

## Local Deployment Guide

There are two ways to run this application locally: using **Node.js** for development or using **Docker** for a containerized environment.

### Method 1: Running with Node.js (for Development)

**Prerequisites:**

*   [Node.js](https://nodejs.org/) (v20 or later recommended)
*   [Git](https://git-scm.com/)

**Steps:**

1.  **Clone the Repository**

    Open your terminal and clone this repository to your local machine:
    ```bash
    git clone https://github.com/kenschultz64/Nano-Banana-App.git
    cd Nano-Banana-App
    ```

2.  **Install Dependencies**

    Install the necessary project dependencies using npm:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**

    This project requires a Google Gemini API key to function.

    *   Create a new file named `.env.local` in the root of the project directory.
    *   Open the `.env.local` file and add your API key in the following format:

    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
    > **Note:** Replace `YOUR_API_KEY_HERE` with your actual Google Gemini API key. The `.env.local` file is included in `.gitignore` and will not be committed to the repository.

4.  **Run the Development Server**

    Start the Vite development server:
    ```bash
    npm run dev
    ```
    The application will now be running and accessible at `http://localhost:3500`.

### Method 2: Running with Docker

**Prerequisites:**

*   [Docker](https://www.docker.com/products/docker-desktop/)

**Steps:**

1.  **Clone the Repository** (if you haven't already):
    ```bash
    git clone https://github.com/kenschultz64/Nano-Banana-App.git
    cd Nano-Banana-App
    ```

2.  **Set Up Environment Variables**

    Create the `.env.local` file as described in Step 3 of the Node.js method. The Docker setup is configured to use this same file.

3.  **Build the Docker Image**

    Build the Docker image using the provided `Dockerfile`. This command will create an image named `nano-banana-app`.
    ```bash
    docker build -t nano-banana-app .
    ```

4.  **Run the Docker Container**

    Run the container, passing in the `.env.local` file to provide the API key. This command maps port 3500 on your machine to port 3500 in the container.
    ```bash
    docker run -d -p 3500:3500 --name nano-banana-container --env-file ./.env.local nano-banana-app
    ```
    The application is now running in a container. You can access it at `http://localhost:3500`.

    To stop the container, run `docker stop nano-banana-container`.
