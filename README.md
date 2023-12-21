# interapp

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=raffles-interact_interapp&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=raffles-interact_interapp)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=raffles-interact_interapp&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=raffles-interact_interapp)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=raffles-interact_interapp&metric=bugs)](https://sonarcloud.io/summary/new_code?id=raffles-interact_interapp)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=raffles-interact_interapp&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=raffles-interact_interapp)

A monorepo for Raffles Interact's administrative application. Built with Next.js and Express along with the Bun runtime.

## Setting up (development)

### Prerequisites 

Ensure that you have the docker daemon running, along with ``bun``, ``make`` and ``docker`` installed in the CLI. 

Clone with ``git clone https://github.com/raffles-interact/interapp.git``

### First time setup

1. Run ``touch ./interapp-backend/.env.local`` and paste the contents of the file that the maintainers gave you. 

2. Navigate to ``./interapp-backend/`` and ``./interapp-frontend/`` and run ``bun i`` in both directories.

3. Run ``make build`` and ``make run``.

4. (Optional) To give yourself all the permissions on the website, ssh into the ``interapp-postgres`` container and run an SQL query that gives your account permissions from 0 - 6. This should look like:
```sql 
INSERT INTO user_permission (username, permission_id, "userUsername") VALUES (‘<username>’, 1, ‘<username>’), (‘<username>’, 2, ‘<username>’), (‘<username>’, 3, ‘<username>’), (‘<username>’, 4, ‘<username>’), (‘<username>’, 5, ‘<username>’), (‘<username>’, 6, ‘<username>’); 
```

### Running

Run ``make build`` and ``make run`` for the development server. If needed, add ``version=(test|prod)`` for test and production servers respectively.

Go to ``localhost:3000`` for frontend and ``localhost:3000/api`` for api routes

## Setting up (testing/non-technical)

Please get ``.env.local`` from the current maintainers of the project, which is sensitive information that should not be shared. They will guide you on where to put the data.

1. If you're just testing the UI/frontend, just have ``docker`` installed in your terminal and have Docker desktop running. You can install docker [here](https://docs.docker.com/engine/install/).

2. Download the ZIP file (Scroll to the green button 'Code' > 'Local' tab > Download ZIP) and unzip it in your directory of choice.

3. Right click the folder which you unzipped and copy its path (the location where the folder is stored at). Open a new terminal (command prompt on windows/terminal on Mac), and type ``cd <path-to-the-directory-which-you-copied>``.

4. Verify docker is installed with ``docker -v`` (If the terminal says ``docker`` is not recognised, try reopening another terminal, failing which, restart your computer) and ensure that you have docker desktop open (important!).

5. Run ``docker compose -f docker-compose.prod.yml up --build -d``.

6. Verify the containers are running by going to docker desktop and ensuring all container icons are **green**.

7. Go to ``localhost:3000`` on your browser, and verify that you can see the site.

8. For contributing, see [CONTRIBUTING.md](CONTRIBUTING.md#product-demo-guidelines)


## thanks
thank you for coming here :kekw:
