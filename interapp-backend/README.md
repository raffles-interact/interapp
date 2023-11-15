# interapp-backend

This section documents the contents of this directory: `interapp-backend`.

## `api` directory

nothing to see here yet

## `db` directory

### entities

`announcement_completion`: A table to track if users have read/completed the tasks set out by every announcement posted.

`announcements`: A table to store all the announcements that are posted by exco.

`hello_world`: A testing table. Used to sanity check the database. Do not use in production.

`service_session_user`: A table to store which users are involved in each session of Interact service.

`service_session`: A table to track the details of each service session.

`service`: A table to store metadata about each service.

`user_permission`: A table to store what permissions each individual user has. See [the permission system](#permission-system).

`user_service`: A table to store the compulsory interact service that each user must attend.

`user`: A table to store all users, and their information.

### migrations

A place to track database changes. Before starting any migrations/changes, please `cd interapp-backend` to get the bun environment.

#### updating database

1. make changes to the `entities/` directory.
2. run `bun run typeorm:generate <your-migration-name>`
3. edit the file found in `migrations/`

#### running and reverting migrations

run `bun run typeorm:run` for a full upgrade, and `bun run typeorm:revert` to revert the last upgrade

#### utils

- Drop db entirely: `bun run typeorm:drop`
- Show migrations: `bun run typeorm:show`
- Sync database (do not use in production): `bun run typeeorm:sync`

## permission system

| role_id | name               | permissions                                                                                                                       |
| ------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 0       | visitor            | none. perhaps just able to view an ‘about’ page? this is a base role – every account should have this role.                       |
| 1       | club_member        | check in/out, inform absence, read announcements, sign up for add. service, check profile                                         |
| 2       | service_ic         | generate QR for weekly service                                                                                                    |
| 3       | mentorship_ic      | generate QR for mentorship service                                                                                                |
| 4       | exco               | create new service sessions manually/automatically post announcements update and edit member list view attendance, statistics etc |
| 5       | super_user         | for development/debugging use only. view raw DB data                                                                              |
| 6       | attendance_manager | Receive emails from absence                                                                                                       |
|         |                    |                                                                                                                                   |
