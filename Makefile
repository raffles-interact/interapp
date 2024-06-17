
.PHONY:
.ONESHELL:

SHELL := bash

# version := dev
ifeq ($(version), )
    DC_CMD := docker compose -f docker-compose.dev.yml
else
    DC_CMD := docker compose -f docker-compose.$(version).yml
    tag := --$(version)
endif

APP_VERSION := $(shell git describe --tag --abbrev=0 2>/dev/null)-$(shell git rev-parse --short HEAD 2>/dev/null)
# if the git describe command fails, we will set the APP_VERSION to an empty string
ifeq ($(APP_VERSION),-)
    APP_VERSION := 
endif
export APP_VERSION

# scenario 1: version=prod, real=true
# we need to down the container, prune the system, and rebuild the container

# scenario 2: version=prod, real=false
# we need to down the container, change the .env file, rebuild the container, and revert the .env file
# replace the IP address with localhost so that the container can connect to the local database

# scenario 3: version=* (dev, staging), real=*
# we need to down the container and rebuild the container
ifeq ($(version), prod)
    ifeq ($(real), true)
    BUILD_COMMANDS = $(DC_CMD) -v down ;\
                     docker system prune -f ;\
                     $(DC_CMD) build --no-cache
    else
    BUILD_COMMANDS = trap "find . -iname .env.*.bak -exec sh -c 'mv $$0 $${0%.bak}' {} \;" SIGINT ;\
                     $(DC_CMD) -v down ;\
                     find . -iname .env.* -exec cp {} {}.bak \; ;\
                     find . -iname .env.* ! -iname "*.bak" -exec sed -i -e 's/13.229.79.214/localhost/g' {} \; ;\
                     $(DC_CMD) build --no-cache ;\
                     find . -iname .env.*.bak -exec sh -c 'mv $$0 $${0%.bak}' {} \;
    endif
else
    BUILD_COMMANDS = $(DC_CMD) -v down ;\
                     $(DC_CMD) build
endif

build:
	$(BUILD_COMMANDS)
watch:
	$(DC_CMD) watch 
run:
	$(DC_CMD) up -d
down:
	$(DC_CMD) -v down

# push docker images to the registry
push:
	docker compose -f docker-compose.prod.yml push
