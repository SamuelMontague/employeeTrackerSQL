
const inquirer = require("inquirer");
const mysql2 = require("mysql2");
const cTable = require("console.table");



const {config} = require("./creds");
const connection = mysql2.createConnection({config});

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

            case "Add Employee?":
                addEmployee();

            case "Update Employee":
                updateEmployee();
            break;

            case "Add Role?":
                addEmployeeRole();
            break;

            case "Add Department?":
                addEmployeeDepartment();
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

// Update Employee //
// Will need a i loop//
// will need a join statement //
// will need prompts // 

function updateEmployee() {
    connection.query("SELECT employee.last_name, role.title FROM employee JOIN role ON employee.role_id = role.id;", function(err, res){

        if (err) throw err
        console.log(res)
        inquierer.prompt([
            {
                type: "rawlist",
                name: "lastName",
                choices: function() {
                    var lastName = [];
                    for (var i = 0; i < res.length; i++) {
                        lastName.push(res[i].last_name);
                    }
                    return lastName;
                },
                message: "What is the Employee's last name?"
            },
            {
                type:"rawlist",
                name: "role", 
                message: "What is the employees new title?",
                choices: selectRole()
            },
        ]).then(function(val){
            let roleId = selectRole().indexOf(val.role) + 1
            connection.query("UPDATE employee SET WHERE ?", 
            {
                last_name: val.lastName
            },
            {
                role_id: roleId
            },
            function(err) {
                if (err) throw err
                console.table(val)
                startPrompt()
            })
        });
    });
}


// Add the employees role //
function addEmployeeRole() {
    connection.query("SELECT role.title AS Title, role.salary AS Salary FROM role", function(err, res){
        inquirer.prompt([
            {
                type: "input",
                name: "Title",
                message: "What is the Title of the role?"
            },
            {
                type: "input",
                name: "Salary",
                message: "How much is the Salary?"
            }

        ]).then(function(res) {
            connection.query(
                "INSERT INTO role SET ?", 
                {
                    title: res.Title,
                    salary: res.Salary,
                },
                function(err) {
                    if (err) throw err
                    console.table(val)
                    startPrompt()
                }
            )
        })
    })
}

// Add a department Function //
// probably needs prompt? //

function addEmployeeDepartment() {


    inquirer.prompt([
        {
            name: "name",
            type:"input",
            message: "What Department would you like to add?"
        }
    ]).then(function(res) {
        let query = connection.query(
            "INSERT INTO department SET ? ",
            {
                name: res.name
            },
            function(err) {
                if (err) throw err
                console.table(val)
                startPrompt()
            }
        )
    })
}