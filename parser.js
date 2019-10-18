let parseLines = (text) => text
    .replace(/\/\/.*|\r?\n/g, '')
    .split(';')
    .slice(0, -1);

let getArguments = (commandLine) => /\(.*\)/
    .exec(commandLine)[0]
    .slice(1, -1)
    .replace(/\\,/g,'%')
    .split(',')
    .map( (el) => el.trim() );

let getCommand = (commandLine) => /^[^\(]*/
    .exec(commandLine)[0]
    .trim();

let getType = (value) => {
    if (value[0] === "#")
        return "cell";
    if (value[0] === "\"")
        return "string";
    if (!isNaN(Number(value)))
        return "number";
}

let parseArguments = (args, memory) => {
    for (let i = 0; i < args.length; i++)
        switch (getType(args[i])) {
            case "cell": 
                args[i] = memory[Number(args[i].substring(1))];
                break;
            case "string":
                args[i] = args[i].replace(/(^\")|("$)/g, '').replace(/%/g, ',');
                break;
            case "number":
                args[i] = Number(args[i]);
                break;
            default:
                throw new Error(`Cannot define type of the argument ${args[i]}.`)
        }
    return args;
};

function buildMemory(commands, gotoCommandName) {
    let memory = [];
    let index = 0;

    commands.forEach( (command) => {
        let commandName = getCommand(command);
        let commandArguments = getArguments(command);
        memory[index] = command;
        index += 1;
        if (commandName === gotoCommandName)
            index = Math.max(index, Number(commandArguments[0]));
    });

    return memory;
};

function actCommand(name, memory, args) {
    switch (name) {
        case "goto":
            return Number(args[0]) - 1;
        case "jump":
            if (args[1])
                return Number(args[0]) - 1;
            break;
        case "input":
            memory[args[0]] = readline.question(args[1]);
            break;
        case "output":
            console.log(args[0]);
            break;
        case "sum":
            memory[args[2]] = args[0] + args[1];
            break;
        case "substract":
            memory[args[2]] = args[0] - args[1];
            break;
        case "divide":
            memory[args[2]] = Math.floor(args[0] / args[1]);
            break;
        case "multiply":
            memory[args[2]] = args[0] * args[1];
            break;
        case "loworeq":
            memory[args[2]] = args[0] <= args[1];
            break;
        case "place":
            memory[args[1]] = args[0];
            break;
        default: 
            throw new Error(`The command ${name} was not found.`);
    }
    return NaN;
}

function runProgramme(memory) {
    for (let i = 0; i < memory.length; i++) {
        let command = getCommand(memory[i]);
        let args = parseArguments( getArguments(memory[i]), memory );
        let actionResult = actCommand(command, memory, args);
        if (!isNaN(actionResult))
            i = actionResult;
    }
};

const fs = require("fs");
const readline = require("readline-sync");
const programmeFilePath = process.argv[2];
if (!fs.existsSync(programmeFilePath))
    throw new Error("The file " + programmeFilePath + " was not found.");
const commandsLines = parseLines( String( fs.readFileSync(programmeFilePath) ) );

let memory = [];

memory = buildMemory(commandsLines, "goto");
runProgramme(memory);