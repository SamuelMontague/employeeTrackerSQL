
-- Create the Database --
DROP DATABASE IF EXISTS employee_trackerDB;

CREATE DATABASE employee_trackerDB;

USE employee_trackerDB;


-- Create department table --
CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) 
);

-- Create role table --
CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES department(id)
);


-- Create Employee Table --
CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name - VARCHAR(30),
    last_name - VARCHAR(30),
    role_id INT,
    manager_id INT,
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)

);

-- Insert the Department seeds -- 
INSERT INTO department
    (name)
VALUES
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');

-- Insert Employee Role Seeds --
INSERT INTO role
    (title, salary, department_id)
VALUES
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 2),
    ('Software Engineer', 120000, 2),
    ('Account Manager', 160000, 3),
    ('Accountant', 125000, 3),
    ('Legal Team Lead', 250000, 4),
    ('Lawyer', 190000, 4);

INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Xavi', 'Hernandez', 1, NULL),
    ('Andres', 'Iniesta', 2, 1),
    ('Lionel', 'Messi', 3, NULL),
    ('David', 'Villa', 4, 3),
    ('Gerard', 'Pique', 5, NULL),
    ('Carles', 'Puyol', 6, 5),
    ('Sergio', 'Busquets', 7, NULL),
    ('Dani', 'Alves', 8, 7);    


-- Selections --
SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;






