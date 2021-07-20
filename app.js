
const inquirer = require("inquirer");
const mysql2 = require("mysql2");
const cTable = require("console.table");
const Database = require("./async-db");

const connection = new Database({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'TwoSoccerKnight',
    database: 'employee_trackerDB'
});

// Select Role for Managers for Add Employees //
async function getManagerNames() {
    let query = "SELECT * FROM employee WHERE manager_id IS NULL";
    
    const rows = await connection.query(query);
    let employeeNames =[];
    for(const employee of rows) {
        employeeNames.push(employee.first_name + " " + employee.last_name);
    }
    return employeeNames;
}

// Select Role for Add Employees //
async function getRoles() {
    let query = "SELECT title FROM role";
    const rows = await connection.query(query);
    
    let roles =[];
    for(const row of rows) {
        roles.push(row.title);
    }
    return roles;
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

async function getDepartmentId(departmentName) {
    let query = "SELECT * FROM department WHERE department.name=?";
    let args = [departmentName];
    const rows = await connection.query(query, args);
    return rows[0].id;
}

async function getRoleId(roleName) {
    let query = "SELECT * FROM role WHERE role.title=?";
    let args = [roleName]; 
    const rows = await connection.query(query, args);
    return rows[0].id;
}

async function getEmployeeId(fullName) {
    let employee = getFirstAndLastName(fullName);
    let query = "SELECT id FROM employee WHERE employee.first_name=? AND employee.last_name=?";
    let args = [employee[0], employee[1]]; 
    const rows = await connection.query(query, args);
    return rows[0].id;
}

async function getEmployeeNames() {
    
    let query = "SELECT * FROM employee";
    const rows = await connection.query(query);
    let employeeNames = []; 
    for(const employee of rows) {
        employeeNames.push(employee.first_name + " " + employee.last_name);
    }
    return employeeNames;
}

async function viewAllRoles() {
    console.log("");
    
    let query = "SELECT * FROM department";
    const rows = await connection.query(query)
    console.log(rows);
}

async function viewAllDepartments(){
    let query = "SELECT * FROM department";
    const rows = await connection.query(query)
    console.log(rows);
}

async function viewAllEmployees() {
    console.log("");
    
    let query = "SELECT * FROM employee";
    const rows = await connection.query(query);
    console.table(rows);
}
async function viewAllEmployeesByDepartment(){
    console.log("");
    let query = "SELECT first_name, last_name, department.name FROM ((employee INNER JOIN role ON role_id = role.id) INNER JOIN department ON department_id = department.id);"
    const rows = await connection.query(query);
    console.table(rows);
}

function getFirstAndLastName (fullName) {
    let employee = fullName.split(" ");
    if(employee.length == 2) {
        return employee;
    }
    const last_name = employee[employee.length-1];
    let first_name = "";
    for (let i=0; i<employee.length-1; i++){
        first_name = first_name + employee[i] + "";
    }
    return [first_name.trim(), last_name];
}

async function updateEmployeeRole(employeeinfo) {
    const roleId = await getRoleId(employeeInfo.role);
    const employee = getFirstAndLastName(employeeInfo.employeeName);

    let query = 'UPDATE employee SET role_id=? WHERE employee.first_name=? AND employee.last_name=?';
    let args = [roleId, employee[0], employee[1]];
    const rows = await connection.query(query, args);
    console.log(`Updated employee ${employee[0]} ${employee[1]} with role ${employeeInfo.role}`);
}

async function addEmployee(employeeInfo){
    let roleId = await getRoleId(employeeInfo.role);
    let managerId= await getEmployeeId(employeeInfo.manager);

    let query = "INSERT into employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)";
    let args = [employeeInfo.first_name, employeeInfo.last_name, roleId, managerId];
    const rows = await connection.query(query, args);
    console.log(`Employee removed: ${employeeName[0]} ${employeeName[1]}`);
}

async function removeEmployee(employeeInfo) {
    const employeeName = getFirstAndLastName(employeeInfo.employeeName);

    let query = "DELETE from employee WHERE first_name=? AND last_name=?";
    let args = [employeeName[0], employeeName[1]];
    const rows = await connection.query(query, args);
    console.log(`Employee removed: ${employeeName[0]} ${employeeName[1]}`);
}

async function addDepartment(departmentInfo) {
    const departmentName = departmentInfo.departmentName;
    let query = 'INSERT into department (name) VALUES (?)';
    let args = [departmentName];
    const rows = await connection.query(query, args);
    console.log(`Added department named ${departmentName}`);
}

async function addRole(roleInfo) {
    const departmentId = await getDepartmentId(roleInfo.departmentName);
    const salary = roleInfo.salary;
    const title = roleInfo.roleName;
    let query = 'INSERT into role (title, salary, department_id) VALUES (?,?,?)';
    let args = [title, salary, departmentId];
    const rows = await connection.query(query, args);
    console.log(`Added role ${title}`);
}

async function mainPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name:"action",
            choices: [
                "Add Department", 
                "Add Employee",
                "Add Role",
                "Remove Employee",
                "Update Employee Role",
                "View All Departments",
                "View All Employees",
                "View All Employees By Departments",
                "View All Roles",
                "Exit"
            ]
        }
    ])
}


// Add Employee //
// inquirer need for prompts// 
async function getAddEmployeeInfo() {
    const managers = await getManagerNames();
    const roles = await getRoles();
    return inquirer.prompt([
        {
            type: "input",
            message: "Enter first name",
            name: "first_name"
        },
        {
            type: "input",
            message: "Enter last name",
            name: "last_name"
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


// Add the employees role //
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

// main function //
// need prompts// 
// probably a switch statement //
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

            case 'Add Role' : {
                const newRole = await getRoleInfo();
                console.log("add a role");
                await addRole(newRole);
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

main();