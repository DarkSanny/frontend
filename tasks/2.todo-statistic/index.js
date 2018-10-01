const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');
const TODO_START_WITH = "\/\/ TODO ";

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    let parsedCommand = parseCommandArguments(command);
    switch (parsedCommand.command) {
        case 'show':
            getAllTodo()
                .forEach((item) => console.log(item.value));
            break;
        case 'exit':
            process.exit(0);
            break;
        case 'important':
            getAllTodo()
                .filter((item) => item.importance > 0)
                .forEach(item => console.log(item.value));
            break;
        case 'user':
            getAllTodo()
                .filter(item => item.user && item.user.toLowerCase() === parsedCommand.argument.toLowerCase())
                .forEach(item => console.log(item.value));
            break;
        case "sort":
            getAllTodo()
                .sort((left, right) => compare(left, right, parsedCommand.argument))
                .forEach(item => console.log(item.value));
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function compare(left, right, field) {
    switch (field) {
        case "importance":
            return compareNumbers(left.importance, right.importance);
        case "user":
            return compareString(left.user, right.user);
        case "date":
            return compareNumbers(left.date, right.date);
    }
}

function compareNumbers(left, right) {
    if (left === NaN)
        return right === NaN ? 0 : 1;
    if (right === NaN)
        return -1;
    return right - left;
}

function compareString(left, right) {
    if (left === undefined)
        return right === undefined ? 0 : 1;
    if (right === undefined)
        return -1;
    return 0;
}

function parseCommandArguments(command) {
    let index = command.indexOf(' ');
    if (index === -1) {
        return {argument: '', command: command};
    }
    return {argument: command.substring(index + 1), command: command.substring(0, index)}
}

function getAllTodo() {
    const result = [];
    for (let file of files) {
        for (let line of file.split("\n")) {
            const indexTodo = line.indexOf(TODO_START_WITH);
            if (indexTodo === -1) {
                continue;
            }
            result.push(parseTodo(line.substring(indexTodo)));
        }
    }
    return result;
}

function parseTodo(line) {
    const todoData = line.split(';');
    const result = {};
    result.value = line;
    if (todoData.length > 1)
        result.user = todoData[0].substring(TODO_START_WITH.length);
    if (todoData.length > 2)
        result.date = Date.parse(todoData[1]);
    result.message = todoData[todoData.length - 1];
    result.importance = line.split("!").length - 1;
    return result;
}

// TODO you can do it!
