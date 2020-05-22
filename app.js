const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

const render = require("./lib/htmlRenderer");

const team = [];

let memberType = "Manager";
let htmlBlock = "";

// Sets manager specific questions
let teamMemberId = "manager's";
let message = "What is your manager's office number?";
let validateSpecial = async (input) => {
  if (input === "" || isNaN(input)) {
    return "Please enter a valid number.";
  } else {
    return true;
  }
};

// Asks user manager specific questions
questions(teamMemberId, message, validateSpecial);

// Function takes teamType

function questions(teamType, specialMessage, specialVal) {
  let nameMessage = "What is your " + teamType + " name?";
  let idMessage = "What is your " + teamType + " id?";
  let emailMessage = "What is your " + teamType + " email?";
  inquirer
    .prompt([
      // Asks for employee's name 
      {
        type: "input",
        message: nameMessage,
        name: "name",
        validate: async (input) => {
          if (input === "") {
            return "Please provide a valid name.";
          } else {
            return true;
          }
        },
      },
      // Asks for employee's id
      {
        type: "input",
        message: idMessage,
        name: "id",
        validate: async (input) => {
          if (input === "" || isNaN(input)) {
            return "Ids can only contain whole numbers.";
          } else {
            return true;
          }
        },
      },
      // Asks for employee's email 
      {
        type: "input",
        message: emailMessage,
        name: "email",
        validate: async (input) => {
          const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
            input
          );
          if (input === "" || !emailValidation) {
            return "Please enter a valid email address.";
          } else {
            return true;
          }
        },
      },
      // Asks special question for Manager, Engineer, and Intern
      // Includes special validation depending on input
      {
        type: "input",
        message: specialMessage,
        name: "special",
        validate: specialVal,
      },
      // Ask what type of team member needs to be created next and if it is needed
      {
        type: "list",
        message: "Which type of team member would you like to add?",
        name: "teamMember",
        choices: [
          "Engineer",
          "Intern",
          "I don't want to add any more team members",
        ],
      },
    ])
    .then((answers) => {
      // Call function to create employee to adds them to team array
      makeEmployee(
        answers.name,
        answers.id,
        answers.email,
        answers.special,
        answers.teamMember
      );
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.log(error);
      }
    });
}

// Function takes user input as parameters
function makeEmployee(
  employeeName,
  employeeId,
  employeeEmail,
  employeeSpecial,
  nextMember
) {
  // Creates object dependant on current employee type and adds them to team array.
  if (memberType == "Manager") {
    let manager = new Manager(
      employeeName,
      employeeId,
      employeeEmail,
      employeeSpecial
    );
    team.push(manager);
  } else if (memberType == "Engineer") {
    let engineer = new Engineer(
      employeeName,
      employeeId,
      employeeEmail,
      employeeSpecial
    );
    team.push(engineer);
  } else {
    let intern = new Intern(
      employeeName,
      employeeId,
      employeeEmail,
      employeeSpecial
    );
    team.push(intern);
  }

  // Determines questions for next employee to be added and set the memberType to that employee type
  if (nextMember == "Engineer") {
    // Sets engineer specific questions 
    let textEngineer = "engineer's";
    let specialEngineerQ = "What is your engineer's GitHub username?";
    let specialEngineerV = async function (input) {
      if (input === "") {
        return "Please enter a valid username.";
      } else {
        return true;
      }
    };

    // Sets current member type to next member requested
    memberType = nextMember;

    // Asks user the questions specific to engineer employee
    questions(textEngineer, specialEngineerQ, specialEngineerV);
  } else if (nextMember == "Intern") {
    // Set intern specific questions and validation
    let textIntern = "intern's";
    let specialInternQ = "What school did your intern attend?";
    let specialInternV = async function (input) {
      if (input === "") {
        return "Please enter a valid username.";
      } else {
        return true;
      }
    };
    // Sets current member type to next member requested
    memberType = nextMember;

    // Asks user the questions specific to intern employee
    questions(textIntern, specialInternQ, specialInternV);
  } else {
    // If employee type not chosen, calls renderer with team array
    htmlBlock = render(team);
    outputHTML();
  }
}

// Generates team.html with team info
function outputHTML() {
  fs.writeFile(outputPath, htmlBlock, (err) => {
    if (err) throw err;
    console.log("The file has been saved! Check the output folder.");
  });
}