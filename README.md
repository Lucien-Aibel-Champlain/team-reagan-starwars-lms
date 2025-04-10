# Setting up packages

Download [wearhouse-template.zip](https://github.com/Lucien-Aibel-Champlain/team-reagan-starwars-lms/blob/gitignore-changes/wearhouse-template.zip) (included with the rest of the repo if cloning)

Unpack it

Open `wearhouse/backend` in cmd, and run `npm install express cors sqlite3`

Copy `wearhouse/backend/node_modules` to the project backend folder

Open `wearhouse/frontend` in cmd, and run `npx create-react-app .`

Copy the following files to the project frontend folder from `wearhouse/frontend`:

 - package.json
 - package-lock.json
 - node_modules (folder)

Should be all good to go!


# Launching
in backend:
node server.js

in frontend:
npm start
