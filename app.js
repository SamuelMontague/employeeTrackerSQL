
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



// Select Role for Add Employees //

 function viewAllRoles() {
 
    let query = "SELECT * FROM role";
    connection.query(query, (err, data) => {
        if(err){
            console.log(err)
        }
        else {
            console.table(data)
            menu();
        }
     })
    }

 function viewAllDepartments(){
    let query = "SELECT * FROM department";
     connection.query(query, (err, data) => {
        if(err){
            console.log(err)
        }
        else {
            console.table(data)
            menu();
        }
     })
   
}

 function viewAllEmployees() {

    let query = "SELECT * FROM employee";
    connection.query(query, (err, data) => {
        if(err){
            console.log(err)
        }
        else {
            console.table(data)
            menu();
        }
     })
}

 function viewAllEmployeesByDepartment(){
    console.log("");
    let query = "SELECT first_name, last_name, department.name FROM ((employee INNER JOIN role ON role_id = role.id) INNER JOIN department ON department_id = department.id);"
    const rows = connection.query(query);
    console.table(rows);
}


 function updateEmployeeRole(employeeInfo) {
    const roleId = employeeInfo.role;
    const employee = employeeInfo.employeeName;

    let query = 'UPDATE employee SET role_id=? WHERE id =? ';
    let args = [roleId, employee];
    const rows = connection.query(query, args);
   console.log(" Updated Employee")
   menu();
}

 function addEmployee(employeeInfo){
    let roleId = employeeInfo.role;
    let managerId= employeeInfo.manager;

    let query = "INSERT into employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)";
    let args = [employeeInfo.first_name, employeeInfo.last_name, roleId, managerId];
    const rows = connection.query(query, args);
    console.log(`Employee Added: ${employeeInfo.first_name} ${employeeInfo.last_name}`);
    menu();
}

 function removeEmployee(employeeInfo) {
    const employeeName = getFirstAndLastName(employeeInfo.employeeName);

    let query = "DELETE from employee WHERE first_name=? AND last_name=?";
    let args = [employeeName[0], employeeName[1]];
    const rows = connection.query(query, args);
    console.log(`Employee removed: ${employeeName[0]} ${employeeName[1]}`);
}

 function addDepartment(departmentInfo) {
    const departmentName = departmentInfo.departmentName;
    let query = 'INSERT into department (name) VALUES (?)';
    let args = [departmentName];
    connection.query(query, args);
    console.log(`Added department named ${departmentName}`);
    menu();
}

 function addRole(roleInfo) {
    const departmentId = roleInfo.departmentName;
    const salary = roleInfo.salary;
    const title = roleInfo.roleName;
    let query = 'INSERT into role (title, salary, department_id) VALUES (?,?,?)';
    let args = [title, salary, departmentId];
    const rows = connection.query(query, args);
    console.log(`Added role ${title}`);
    menu();
}

function menu() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name:"option",
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
    ]).then(answers => {
        console.log(answers)
        main(answers.option)
    })
}


// Add Employee //
// inquirer need for prompts// 
 function getAddEmployeeInfo() {
     let roleQuery = "SELECT * FROM role"
     let managerQuery = "SELECT * FROM employee"
    connection.query(roleQuery, (err, data) =>{
        let roleChoices = [] 
        for (const role of data){
            roleChoices.push(
                {
                    name: role.title,
                    value: role.id
                }
            )
        }
        connection.query(managerQuery, (err, data)=> {
            let managerChoices = []
            for (const manager of data){
                managerChoices.push(
                    {
                        name: manager.first_name + " " + manager.last_name,
                        value: manager.id
                    }
                )
            }
            inquirer.prompt([
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
                    choices: 
                       roleChoices
                    
                },
                {
                    type: "list",
                    message: "Whats their managers name?",
                    name: "manager",
                    choices: 
                        managerChoices
                    
                }
            ]).then(answers =>{
                console.log(answers)
                addEmployee(answers);
            })
        })
    })
    
}
       
 function getRemoveEmployeeInfo() {
    const employees = getEmployeeNames();
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

 function getDepartmentInfo() {
    inquirer
    .prompt([
        {
            type: "input",
            message: "What is the title of the new department?",
            name: "departmentName", 
        }]).then(answers =>{
            console.log(answers)
            addDepartment(answers)
        })
}


// Add the employees role //
 function getRoleInfo() {
   let query = "SELECT * FROM department";
   let departments = [];
   connection.query(query, (err, data) => {
     if (err) {
       console.lot(err);
     }
     for (const department of data) {
       departments.push({
         name: department.name,
         value: department.id,
       });
     }
     console.log(departments)
     inquirer
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
           choices: departments,
         },
       ])
       .then((answers) => {
         console.log(answers);
         addRole(answers);
       });
   });
 }

// Update Employee Info //

// will need prompts // 

 function getUpdateEmployeeRoleInfo(){
    let query = "SELECT * FROM employee";
    connection.query(query, (err, data) => {
        let employeeChoices = []
        for(const employee of data) {
            employeeChoices.push({
                name: employee.first_name + " " + employee.last_name,
                value: employee.id
        
            });

        }
        let roleQuery = "SELECT * FROM role"
        connection.query(roleQuery, (err, data) => {
            let roleChoices = []
            for (const role of data){
                roleChoices.push({
                    name: role.title,
                    value: role.id
                })
            }

        inquirer.prompt([
        {
            type: "list",
            message: "Which employee would you like to update?",
            name: "employeeName",
            choices: 
                employeeChoices
           
        },
        {
            type: "list",
            message: "What is the employee's new role?",
            name: "role",
            choices: 
                roleChoices
           
        }]).then(answers=> {
            console.log(answers)
            updateEmployeeRole(answers)
        })
        })
    });

}

// main function //
// need prompts// 
// probably a switch statement //
function main(option) {
    //let exitLoop = false;
    //while(!exitLoop) {
        //const prompt = menu();
            //console.log(prompt)
        switch(option) {
            case 'Add Department' : {
                getDepartmentInfo();
             //addDepartment(newDepartmentName);
                break;
            }

            case 'Add Employee' : {
                getAddEmployeeInfo();
                //console.log("add an employee");
                //console.log(newEmployee);
             //addEmployee(newEmployee);
                break;
            }

            case 'Add Role' : {
                getRoleInfo();
                //console.log("add a role");
             //addRole(newRole);
                break;
            }

            case 'Remove Employee' : {
                const employee = getRemoveEmployeeInfo();
             removeEmployee(employee);
                break;
            }

            case 'Update Employee Role' : {
               getUpdateEmployeeRoleInfo();
             //updateEmployeeRole(employee);
                break;
            }

            case "View All Departments": {
             viewAllDepartments();
                break;
            }

            case 'View All Employees': {
             viewAllEmployees();
                break;
            }

            case 'View All Employees By Department': {
             viewAllEmployeesByDepartment();
            }

            case 'View All Roles': {
             viewAllRoles();
                break;
            }

            case 'Exit': {
                exitLoop = true;
                process.exit(0); //successful exit
                return;
            }

            default:
                console.log(`Internal warning. ${option}`)

        }
    //}
}
process.on("exit",  function(code) {
 connection.close();
    return console.log(`Closing with code ${code}`);
})

//main();
menu();