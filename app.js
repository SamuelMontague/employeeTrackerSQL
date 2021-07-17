
const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");



const {config} = require("./creds");
const connection = mysql.createConnection({config});

connection.connect(function(err){
    if(err) throw err 
    console.log(connection.threadId)
    startPrompt();
});

function startPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name:"choice",
            choices: [
                "View All Employees",
                "View All Employee's By Roles",
                "View All Employees By Departments",
                "Update Employee",
                "Add Employee?",
                "Add Role?",
                "Add Department?", 
            ]
        }
    ]).then(function(val){
        switch (val.choice) {
            case "View All Employees":
                viewAllEmployees();
            break;

            case "View All Employee's By Roles":
                viewAllRoles();
            break;

            case "View All Employees By Departments":
                viewAllDepartments();
            break;

            case "Update Employee":
                updateEmployee();
            break;

            case "Add Role?":
                addRole();
            break;

            case "Add Department?":
                addDepartment();
            break;
        }
    })
}


// View All Employees Function // 
function viewAllEmployees() {
    connection.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;",
    function(err, res) {
        if (err) throw err
        console.table(res)
        startPrompt()
    })
}

// View All Roles Function //
function viewAllRoles() {
    connection.query("SELECT employee.first_name, employee.last_name, role.title, AS Title FROM employee JOIN role ON employee.role_id = role.id;",
    function(err, res) {
        if (err) throw err
        console.table(res)
        startPrompt()
    })
}

// View All Employees by Departments // 
function viewAllDepartments() {
    connection.query("SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;",
    function(err, res) {
        if (err) throw err
        console.table(res)
        startPrompt()
    })
}

// Select Role for Add Employees //
// (needs an i loop and a .push) //
const roleArr = [];
function selectRole() {
    connection.query("SELECT * FROM role", function(err, res){
        if (err) throw err 
        for (var i = 0; i < res.length; i++) {
            roleArr.push(res[i].title);
        }
    })
    return roleArr;
}


// Select Role for Managers for Add Employees //
// (needs an i loop and a .push) //
const managersArr = []; 
function selectManager() {
    connection.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", function(err, res) {
        if (err) throw err 
        for (var i = 0; i < res.length; i++) {
            managersArr.push(res[i].first_name);
        }
    })
    return managersArr;
}

// Add Employee //
// inquirer need for prompts// 
function addEmployee() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter first name",
            name: "firstname"
        },
        {
            type: "input",
            message: "Enter last name",
            name: "last name"
        },
        {
            type: "list",
            message: "What is their role?",
            name: "role",
            choices: selectRole()
        },
        {
            type: "rawlist",
            message: "Whats their managers name?",
            name: "choice",
            choices: selectManager()
        }
    ]).then(function (val) {
        var roleId = selectRole().indexOf(val.role) + 1
        var managerId = selectManager().indexOf(val.choice) +1 
        connection.query("INSERT INTO employee SET ?", {
            first_name: val.firstName,
            last_name: val.lastName,
            manager_id: managerId,
            role_id: roleId

        }, function(err) {
            if (err) throw err
            console.table(val)
            startPrompt()
        }
        )
    })
}