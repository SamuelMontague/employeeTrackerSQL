
const inquirer = require("inquirer");
const mysql2 = require("mysql2");
const cTable = require("console.table");

const connection = mysql2.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'TwoSoccerKnight',
        database: 'employee_trackerDB'
});

connection.connect(function(err){
    if(err) throw err 
    console.log(connection.threadId)
    startPrompt();
});

async function startPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name:"action",
            choices: [
                "View All Employees",
                "View All Departments",
                "View All Roles",
                "View All Employees By Departments",
                "Update Employee Role",
                "Add Employee",
                "Add Roles",
                "Add Department", 
                "Remove Employee",
                "Exit"
            ]
        }
    ])
}
   



// View All Employees Function //

async function viewAllEmployees() {
    console.log("");

    let query = "SELECT * FROM employee";
    const rows = await connection.query(query);
    console.table(rows);
}

// View All Roles Function //

async function viewAllRoles() {
    console.log("");

    let query = "SELECT * FROM department";
    const rows = await connection.query(query)
    console.log(rows);
}

// View All Employees by Departments // 

async function viewAllDepartments(){
    let query = "SELECT * FROM department";
    const rows = await connection.query(query)
    console.log(rows);
}

// Select Role for Add Employees //
// (needs an i loop and a .push) //
async function getRoles() {
    let query = "SELECT title FROM role";
    const rows = await connection.query(query);

    let roles =[];
    for(const row of rows) {
        roles.push(row.title);
    }
    return roles;
}


// Select Role for Managers for Add Employees //
async function getManagers() {
    let query = "SELECT * FROM employee WHERE manager_id IS NULL";
    
    const rows = await connection.query(query);
    let employeeNames =[];
    for(const employee of rows) {
        employeeNames.push(employee.first_name + " " + employee.last_name);
    }
    return employeeNames;
}

// Add Employee //
// inquirer need for prompts// 
async function addEmployee() {
    const managers = await getManagerNames();
    const roles = await getRoles();
    return inquirer.prompt([
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
            choices: [
                ...roles
            ]
        },
        {
            type: "list",
            message: "Whats their managers name?",
            name: "manager",
            choices: [
                ...managers
            ]
        }
    ])
}
       
async function getRemoveEmployeeInfo() {
    const employees = await getEmployeeNames();
    return inquirer
    .prompt([
        {
            type: "list",
            message: "Which employee do you want to remove?",
            name: "employeeName",
            choices: [
                ...employees
            ]
        }])
} 

async function getDepartmentInfo() {
    return inquirer
    .prompt([
        {
            type: "input",
            message: "What is the title of the new department?",
            name: "departmentName", 
        }])
}

async function getDepartmentNames(){
    let query = "SELECT name FROM department";
    const rows = await connection.query(query);

    let departments = [];
    for(const row of rows) {
        departments.push(row.name);
    }
    return departments;
}

async function getRoleInfo() {
    const departments = await getDepartmentNames();
    return inquirer
    .prompt([
        {
            type: "input",
            message: "What is the title of the new role?",
            name: "roleName",  
        },
        {
            type: "input",
            message: "What is the salary of the new role?",
            name: "salary", 
        },
        {
            type: "list",
            message: "What department uses this role??",
            name: "departmentName", 
            choices: [
                ...departments
            ]
        }

])
}

// Update Employee Info //

// will need prompts // 

async function getUpdateEmployeeRoleInfo(){
    const employees = await getEmployeeNames();
    const roles= await getRoles();
    return inquirer.prompt([
        {
            type: "list",
            message: "Which employee would you like to update?",
            name: "employeeName",
            choices: [
                ...employees
            ] 
        },
        {
            type: "list",
            message: "What is the employee's new role?",
            name: "role",
            choices: [
                ...roles
            ]
        }])
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


async function main() {
    let exitLoop = false;
    while(!exitLoop) {
        const prompt = await mainPrompt();

        switch(prompt.action) {
            case 'Add department' : {
                const newDepartmentName = await getDepartmentInfo();
                await addDepartment(newDepartmentName);
                break;
            }

            case 'Add employee' : {
                const newEmployee = await getAddEmployeeInfo();
                console.log("add an employee");
                console.log(newEmployee);
                await addEmployee(newEmployee);
                break;
            }

            case 'Remove employee' : {
                const employee = await getRemoveEmployeeInfo();
                await removeEmployee(employee);
                break;
            }

            case 'Update employee role' : {
                const employee = await getUpdateEmployeeRoleInfo();
                await updateEmployeeRole(employee);
                break;
            }

            case 'View all departments': {
                await viewAllDepartments();
                break;
            }

            case 'View all employees': {
                await viewAllEmployees();
                break;
            }

            case 'View all employees by department': {
                await viewAllEmployeesByDepartment();
            }

            case 'View all roles': {
                await viewAllRoles();
                break;
            }

            case 'Exit': {
                exitLoop = true;
                process.exit(0); //successful exit
                return;
            }

            default:
                console.log(`Internal warning. ${prompt.action}`)

        }
    }
}
process.on("exit", async function(code) {
    await connection.close();
    return console.log(`Closing with code ${code}`);
})