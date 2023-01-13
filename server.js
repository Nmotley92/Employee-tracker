const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');


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
                viewDepartments();
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
                connection.query('INSERT INTO roles SET ?', { title: answer.title, salary: answer.salary, department_id: department_id }, (error, results) => {
                    error ? console.log(error) : console.log('Role added!');
                    viewRoles();
                });
            });
        });

}

function addEmployee() {
    // Prompt the user for the employee details and add it to the database
    // first name, last name, role, manager
    // query the database to display a list of roles as roles: [ ]
    // query the database to display a list of employees as managers: [ ]
    const roles = [];
    connection.query('SELECT * FROM roles', (error, results) => {
        error ? error : results.forEach(role => roles.push(role.title));
    });
    const managers = [];
    connection.query('SELECT * FROM employees', (error, results) => {
        error ? error : results.forEach(employee => managers.push(employee.first_name + ' ' + employee.last_name));
    });
    inquirer
        .prompt([
            {
                name: 'first_name',
                type: 'input',
                message: 'What is the first name of the employee?'
            },
            {
                name: 'last_name',
                type: 'input',
                message: 'What is the last name of the employee?'
            },
            {
                name: 'role',
                type: 'list',
                message: 'What is the role of the employee?',
                choices: roles
            },
            {
                name: 'manager',
                type: 'list',
                message: 'Who is the manager of the employee?',
                choices: managers
            }
        ])
        .then(answer => {
            connection.query('SELECT id FROM roles WHERE title = ?', [answer.role], (err, res) => {
                if (err) throw console.log(err);
                const role_id = res[0].id;
                connection.query(`SELECT id FROM employees WHERE concat (employees.first_name, ' ', employees.last_name) = ?`, [answer.manager], (err, res) => {
                    if (err) throw console.log(err);
                    const manager_id = res[0].id;
                    connection.query('INSERT INTO employees SET ?', { first_name: answer.first_name, last_name: answer.last_name, role_id: role_id, manager_id: manager_id }, (error, results) => {
                        error ? console.log(error) : console.log('Employee added!');
                        viewEmployees();
                    });
                });
            });

        });
}

function updateEmployeeRole() {
    employees = [];
    roles = [];
    // Prompt the user for the employee and role to update
    Promise.all([
        new Promise((resolve, reject) => {
            connection.query('SELECT * FROM employees', (error, results) => {
                if (error) reject(error);
                results.forEach(employee => employees.push(employee.first_name + ' ' + employee.last_name));
                resolve();
            });
        }),
        new Promise((resolve, reject) => {
            connection.query('SELECT * FROM roles', (error, results) => {
                if (error) reject(error);
                results.forEach(role => roles.push(role.title));
                resolve();
            });
        })
    ]).then(() => {
        // show inquirer prompt
        inquirer
            .prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Which employee would you like to update?',
                    choices: employees,
                },
                {
                    name: 'role',
                    type: 'list',
                    message: 'What is the new role of the employee?',
                    choices: roles,
                },
            ])
            .then((answer) => {
                // update the employee
                // update the employee's role but must first change the employees first and last name back to their id
                connection.query(`SELECT id FROM employees WHERE CONCAT (employees.first_name, ' ', employees.last_name) = ?`, [answer.employee], (err, res) => {
                    if (err) throw console.log(err);
                    const employee_id = res[0].id;
                    connection.query('SELECT id FROM roles WHERE title = ?', [answer.role], (err, res) => {
                        if (err) throw console.log(err);
                        const role_id = res[0].id;
                        connection.query('UPDATE employees SET role_id = ? WHERE id = ?', [role_id, employee_id], (error, results) => {
                            error ? console.log(error) : console.log('Employee role updated!');
                            viewEmployees();
                        });

                    });
                });
            });

    });
}

function updateEmployeeManager() {
    // Prompt the user for the employee and their new manager and update it in the database
    // query the database to display a list of employees as employees: [ ]
    // query the database to display a list of employees as managers: [ ]
    // update the employee's manager
    const employees = [];
    const managers = [];
    Promise.all([
        new Promise((resolve, reject) => {
            connection.query('SELECT * FROM employees', (error, results) => {
                if (error) reject(error);
                results.forEach(employee => employees.push(employee.first_name + ' ' + employee.last_name));
                resolve();
            });
        }),
        new Promise((resolve, reject) => {
            connection.query('SELECT * FROM employees', (error, results) => {
                if (error) reject(error);
                results.forEach(employee => managers.push(employee.first_name + ' ' + employee.last_name));
                resolve();
            });
        })
    ]).then(() => {
        inquirer
            .prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Which employee would you like to update?',
                    choices: employees
                },
                {
                    name: 'manager',
                    type: 'list',
                    message: 'Who is the new manager of the employee?',
                    choices: managers
                }
            ])
            .then(answer => {
                connection.query(`SELECT id FROM employees WHERE CONCAT (employees.first_name, ' ', employees.last_name) = ?`, [answer.employee], (err, res) => {
                    if (err) throw console.log(err);
                    const employee_id = res[0].id;
                    connection.query(`SELECT id FROM employees WHERE CONCAT (employees.first_name, ' ', employees.last_name) = ?`, [answer.manager], (err, res) => {
                        if (err) throw console.log(err);
                        const manager_id = res[0].id;
                        connection.query('UPDATE employees SET manager_id = ? WHERE id = ?', [manager_id, employee_id], (error, results) => {
                            error ? console.log(error) : console.log('Employee manager updated!');
                            viewEmployees();
                        });
                    });
                });
            });
    });

}

                    
                    

                
            

function viewDepartmentBudget() {
            // Query the database to display the total budget for a department
            // query the database to display a list of departments as departments: [ ]
            // prompt user for with department they would like to view the budget for
            // display the total budget for the department
            const departments = [];
            Promise.all([
                new Promise((resolve, reject) => {
                    connection.query('SELECT * FROM departments', (error, results) => {
                        if (error) reject(error);
                        results.forEach(department => departments.push(department.name));
                        resolve();
            });
        })
    ]).then(() => {
            inquirer
                .prompt([
                    {
                        name: 'departments',
                        type: 'list',
                        message: 'Which department would you like to view the budget for?',
                        choices: departments
                    }
                ])
                .then(answer => {
                    connection.query(
                        `SELECT SUM(roles.salary) as total_budget FROM roles 
                         JOIN departments ON departments.name = ? AND roles.department_id = departments.id`,
                        [answer.departments],
                        (error, results) => {
                          if (error) {
                            console.log(error);
                          } else {
                            console.log(`Total budget for department ${answer.departments} is: ${results[0].total_budget}`);
                            viewEmployees();
                        
                          }
                        });

                });
            
        }
    );
}