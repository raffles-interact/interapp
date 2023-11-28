
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


build:
	$(DC_CMD) -v down
	$(DC_CMD) build 
watch:
	$(DC_CMD) watch 
run:
	$(DC_CMD) up -d
down:
	$(DC_CMD) -v down

	
