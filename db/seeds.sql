INSERT INTO departments (id, name) VALUES
      (1, 'Sales'),
      (2, 'Marketing'),
      (3, 'Engineering');
      
    INSERT INTO roles (id, title, salary, department_id) VALUES
      (1, 'Sales Lead', 100000, 1),
      (2, 'Salesperson', 75000, 1),
      (3, 'Marketing Lead', 90000, 2),
      (4, 'Marketing Coordinator', 60000, 2),
      (5, 'Software Engineer', 120000, 3),
      (6, 'DevOps Engineer', 110000, 3),
      (7, 'Quality Assurance Engineer', 80000, 3);
      
    INSERT INTO employees (id, first_name, last_name, role_id, manager_id) VALUES
      (1, 'John', 'Doe', 1, null),
      (2, 'Jane', 'Doe', 2, 1),
      (3, 'Alice', 'Smith', 3, null),
      (4, 'Bob', 'Smith', 4, 3),
      (5, 'Eve', 'Johnson', 5, null),
      (6, 'Frank', 'Johnson', 6, 5),
      (7, 'Gina', 'Williams', 7, 6);