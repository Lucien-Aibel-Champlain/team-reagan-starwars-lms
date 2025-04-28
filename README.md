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


# **1: Login**

To login you need an email and password that is already in the system, below is a table of existing users to copy and paste. Within the system there are two types of users, admin and non-admin. Non-admin users just function as teachers, and will only have access to their classes, grades, materials, and a table to control student enrollment. Admin users can access and edit all tables.

Login Data:

| Email | Password | Note |
| ----- | ----- | ----- |
|  ADMIN.ADMINSON@school.edu |  password | This user is an admin and will be able to edit and view all tables. |
|  Jane.Doe@school.edu |  12345 | This user is a teacher and will only be able to edit tables associated with their courses. |

Note: There are other valid logins

# **2: Viewing & Navigation**

## **2.1: Basic Navigation**

At the top of the screen is the information of the logged in user, their name, role, employeeID, and whether they have admin privileges. Below this is a list of tables that can be edited, viewed, or both by the user. Admins have viewing and edit access to all tables. Non-Admins (teachers) are allowed to view all tables except the “Employees” and “Roles” tables, due to them containing sensitive data about other employees like passwords. Some of the tables are reactive based on the user’s selection of items in other tables. The grades table will display grades only for the material selected in the section selected, the materials table will only display the materials/assignments used in the section that is selected on the sections table. 

## **2.2: Section Navigation**

Regardless of privilege, users are allowed to select a section and view relevant information. If you select a specific section:

* The materials table will update to only show materials assigned to the selected section.   
  * The grades table will also update to the default selection in the material table.  
* The students table will update to highlight all students enrolled in that section in white.

# **3: Table Modification**

## **3.1: Inserting Data**

If the user is allowed to edit a given table the last row of the table will display multiple fields to allow the user to insert data. These fields are a mix of text boxes and dropdowns, depending on the type of data they are inserting into the database. Once all fields have been filled, the last cell of the row has a button to add the entry to the table. 

## **3.2: Editing & Deletion** 

If the user is allowed to edit a given table the last column will have two buttons, one pair for each row. These allow the user to either edit or delete the values stored in that row. 

* The **DELETE** button will prompt the user to confirm the deletion before removing the entry from the database and the table.  
* The **EDIT** button will let the user edit the values using the last row of the table, where they would add a new entry otherwise. Press the update button to update the entry.

# **4: Specific Questions** 

Q: How do I view the meeting time and location of a class?  
A: Scroll until you see the “sections“ table, the class should be visible assuming your user is an admin or assigned to teach it.

Q: How do I view the students who are in a specific class, and how would I enroll or unenroll them?  
A: Make sure you have selected the correct class by clicking on it. You will then be able to see the students who are in the class (their rows will be white) and students who are not in the class (their rows will be dark grey). If you want to change the enrollment of a student, first select the class, then scroll down to the students table, you will then see in the last column the option to toggle their enrollment. 

Q: How do I view grades?  
A: To find a grade, first select a section then a material, then scroll down to the grades table to see what students got. 

