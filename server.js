const mysql = require('mysql2');
const inquirer = require('inquirer');
const express = require('express');
const cTable = require('console.table');
const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Iam1witbeingnvrseen!',
    database: 'employee_db'
});

connection.connect(error => {
    if (error) throw error;
    console.log('Connected to the database!');
    start();
});

function start() {
    inquirer
        .prompt({
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Update an employee manager',
                'View employees by manager',
                'View employees by department',
                'Delete a department',
                'Delete a role',
                'Delete an employee',
                'View department budget',
                'Exit'
            ]
        })
        .then(answer => {
            switch (answer.action) {
                case 'View all departments':
                    viewDepartments();
                    break;
                case 'View all roles':
                    viewRoles();
                    break;
                case 'View all employees':
                    viewEmployees();
                    break;
                case 'Add a department':
                    addDepartment();
                    break;
                case 'Add a role':
                    addRole();
                    break;
                case 'Add an employee':
                    addEmployee();
                    break;
                case 'Update an employee role':
                    updateEmployeeRole();
                    break;
                case 'Update an employee manager':
                    updateEmployeeManager();
                    break;
                case 'View employees by manager':
                    viewEmployeesByManager();
                    break;
                case 'View employees by department':
                    viewEmployeesByDepartment();
                    break;
                case 'Delete a department':
                    deleteDepartment();
                    break;
                case 'Delete a role':
                    deleteRole();
                    break;
                case 'Delete an employee':
                    deleteEmployee();
                    break;
                case 'View department budget':
                    viewDepartmentBudget();
                    break;
                case 'Exit':
                    connection.end();
                    break;
            }
        });
}

function viewDepartments() {
    // Query the database to display a list of departments
    connection.query('SELECT * FROM departments', (error, results) => {
        error ? error : console.table(results);
        start();
    });
}

function viewRoles() {
    // Query the database to display a list of roles
    connection.query('SELECT roles.id, roles.title, roles.salary, departments.name AS department FROM roles JOIN departments ON roles.department_id = departments.id', (error, results) => {
        error ? error : console.table(results);
        start();
    });
}

function viewEmployees() {
    // Query the database to display a list of employees
    connection.query(`SELECT employees.id, employees.first_name as 'first name', employees.last_name as 'last name', 
    roles.title as 'role title', departments.name as department, roles.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) as 'manager'
    FROM employees 
    JOIN roles ON employees.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees manager ON employees.manager_id = manager.id`, (error, results) => {
        error ? error : console.table(results);
        start();
    });
}

function addDepartment() {
    // Prompt the user for the department name and add it to the database
    inquirer
        .prompt({
            name: 'department',
            type: 'input',
            message: 'What is the name of the department?'
        })
        .then(answer => {
            connection.query('INSERT INTO departments SET ?', { name: answer.department }, (error, results) => {
                error ? console.log(error) : console.log('Department added!');
                start();
            });
        });
}

function addRole() {
    // Prompt the user for the role details and add it to the database
    // query the database to display a list of departments
    // display the list of departments as choices: [ ]
    const departments = [];
    connection.query('SELECT * FROM departments', (error, results) => {
        error ? error : results.forEach(department => departments.push(department.name));
    });

    inquirer
        .prompt([
            {
                name: 'title',
                type: 'input',
                message: 'What is the title of the role?'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary of the role?'
            },
            {
                name: 'department',
                type: 'list',
                message: 'What is the department ID of the role?',
                choices: departments

            }
        ])
        .then(answer => {
            connection.query('SELECT id FROM departments WHERE name = ?', [answer.department], (err, res) => {
                if (err) throw err;
                const department_id = res[0].id;
                connection.query('INSERT INTO roles SET ?', {title: answer.title, salary: answer.salary, department_id: department_id}, (error, results) => {
                error ? console.log(error) : console.log('Role added!');
                start();
            });
        });
    });

}

