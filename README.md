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

If you're just testing the UI/frontend, just have ``docker`` installed in your terminal and have Docker desktop running. You can install docker [here](https://docs.docker.com/engine/install/).

Download the ZIP file (Scroll to the green button 'Code' > 'Local' tab > Download ZIP) and unzip it in your directory of choice.

Right click the folder which you unzipped and copy its path (may differ based on operating system). Open a new terminal (command prompt on windows/terminal on Mac), and type ``cd <path-to-the-directory-which-you-copied>``.

Verify docker is installed with ``docker -v`` and ensure that you have docker desktop open (important!).

Run ``docker compose build --no-cache && docker compose up -d``.

Verify the containers are running by going to docker desktop and ensuring all container icons are GREEN.

Go to ``localhost:3000`` on your browser.


## thanks
thank you for coming here :kekw:
