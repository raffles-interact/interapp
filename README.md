# interapp

A monorepo for Raffles Interact's administrative application. Built with Next.js and Express along with the Bun runtime.

## Setting up (development)

### Prerequisites 

Ensure that you have the docker daemon running, along with ``bun``, ``make`` and ``docker`` installed in the CLI. 

Clone with ``git clone https://github.com/raffles-interact/interapp.git``

### Running

Ensure you are in the root of the project. Run ``make build`` and ``make run`` (TODO).

If your IDE is giving you import errors, run ``bun i`` in the terminal.

Go to ``localhost:3000`` for frontend and ``localhost:3000/api`` for api routes

## Setting up (testing/non-technical)

1. If you're just testing the UI/frontend, just have ``docker`` installed in your terminal and have Docker desktop running. You can install docker [here](https://docs.docker.com/engine/install/).

2. Download the ZIP file (Scroll to the green button 'Code' > 'Local' tab > Download ZIP) and unzip it in your directory of choice.

3. Right click the folder which you unzipped and copy its path (the location where the folder is stored at). Open a new terminal (command prompt on windows/terminal on Mac), and type ``cd <path-to-the-directory-which-you-copied>``.

4. Verify docker is installed with ``docker -v`` (If the terminal says ``docker`` is not recognised, try reopening another terminal, failing which, restart your computer) and ensure that you have docker desktop open (important!).

5. Run ``docker compose -f docker-compose.dev.yml up --build -d``.

6. Verify the containers are running by going to docker desktop and ensuring all container icons are **green**.

7. Go to ``localhost:3000`` on your browser, and verify that you can see the site.


## thanks
thank you for coming here :kekw:
