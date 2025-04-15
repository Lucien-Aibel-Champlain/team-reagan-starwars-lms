# Setting up packages
by Lucien (NOT DEFAULT JUNK DO NOT SKIP)

In order to build the required packages for your specific OS, please follow these directions. You have to work on the original template because a later command will try and set the project up from scratch, requiring an empty frontend folder. You can then copy those set up packages to the real project.

Download [wearhouse-template.zip](https://github.com/Lucien-Aibel-Champlain/team-reagan-starwars-lms/blob/gitignore-changes/wearhouse-template.zip) (included with the rest of the repo if cloning)

Unpack it

Open `wearhouse/backend` in cmd, and run `npm init -y`

Then, in the same window, `npm install express cors sqlite3`

Copy the following files to the project backend folder from `wearhouse/backend`:

 - package.json
 - package-lock.json
 - node_modules (folder)

Open `wearhouse/frontend` in cmd, and run `npx create-react-app .`

Copy the following files to the project frontend folder from `wearhouse/frontend`:

 - package.json
 - package-lock.json
 - node_modules (folder)

Should be all good to go!

Gitignores are set up so node-modules won't be touched, but the rest of the project can safely change around it. Should be able to interact like any other repo--use "git pull" to get the latest version and all that.


# Launching
in backend:
node server.js

in frontend:
npm start
