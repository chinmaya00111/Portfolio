// Calculator state
let currentInput = '0';
let expression = '';
let memory = 0;
let history = [];
let lastResult = null;

// DOM elements
const mainDisplay = document.getElementById('mainDisplay');
const secondaryDisplay = document.getElementById('secondaryDisplay');
const historyList = document.getElementById('historyList');

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
    loadHistory();
});

// Display update function
function updateDisplay() {
    mainDisplay.textContent = currentInput;
    secondaryDisplay.textContent = expression;
}

// Number input
function insertNumber(num) {
    if (currentInput === '0' || currentInput === 'Error') {
        currentInput = num;
    } else {
        currentInput += num;
    }
    updateDisplay();
}

// Operator input
function insertOperator(op) {
    if (expression && !isNaN(currentInput)) {
        expression += currentInput + ' ' + op + ' ';
    } else if (expression === '' && !isNaN(currentInput)) {
        expression = currentInput + ' ' + op + ' ';
    } else if (op === '(' || op === ')') {
        if (currentInput === '0') {
            currentInput = op;
        } else {
            currentInput += op;
        }
        updateDisplay();
        return;
    } else if (op === '.') {
        if (!currentInput.includes('.')) {
            currentInput += op;
        }
        updateDisplay();
        return;
    }
    
    currentInput = '0';
    updateDisplay();
}

// Function input (sin, cos, tan, etc.)
function insertFunction(func) {
    if (currentInput === '0') {
        currentInput = func;
    } else {
        currentInput += func;
    }
    updateDisplay();
}

// Insert mathematical constants
function insertValue(value) {
    if (currentInput === '0') {
        currentInput = value;
    } else {
        currentInput += '*' + value;
    }
    updateDisplay();
}

// Calculate function
function calculate() {
    try {
        let fullExpression = expression + currentInput;
        
        if (!fullExpression.trim()) {
            return;
        }

        // Replace mathematical symbols and functions
        fullExpression = fullExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E');

        // Convert degrees to radians for trigonometric functions
        fullExpression = convertDegreesToRadians(fullExpression);

        // Evaluate the expression
        const result = eval(fullExpression);
        
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Invalid calculation');
        }

        // Add to history
        addToHistory(expression + currentInput, result);

        // Update display
        lastResult = result;
        currentInput = result.toString();
        expression = '';
        
        updateDisplay();

    } catch (error) {
        currentInput = 'Error';
        expression = '';
        updateDisplay();
        setTimeout(() => {
            currentInput = '0';
            updateDisplay();
        }, 2000);
    }
}

// Convert degrees to radians for trigonometric functions
function convertDegreesToRadians(expr) {
    return expr.replace(/(Math\.sin|Math\.cos|Math\.tan)\(([^)]+)\)/g, 
        function(match, func, angle) {
            return func + '((' + angle + ') * Math.PI / 180)';
        }
    );
}

// Clear functions
function clearAll() {
    currentInput = '0';
    expression = '';
    updateDisplay();
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Toggle sign
function toggleSign() {
    if (currentInput !== '0' && currentInput !== 'Error') {
        if (currentInput.startsWith('-')) {
            currentInput = currentInput.substring(1);
        } else {
            currentInput = '-' + currentInput;
        }
        updateDisplay();
    }
}

// Factorial function
function factorial() {
    try {
        const num = parseInt(currentInput);
        if (num < 0 || num > 170) {
            throw new Error('Factorial not defined for this number');
        }
        
        let result = 1;
        for (let i = 2; i <= num; i++) {
            result *= i;
        }
        
        addToHistory(currentInput + '!', result);
        currentInput = result.toString();
        expression = '';
        updateDisplay();
        
    } catch (error) {
        currentInput = 'Error';
        updateDisplay();
        setTimeout(() => {
            currentInput = '0';
            updateDisplay();
        }, 2000);
    }
}

// Memory functions
function memoryStore() {
    try {
        memory = parseFloat(currentInput);
        showMemoryOperation('MS: ' + memory);
    } catch (error) {
        showMemoryOperation('Memory Error');
    }
}

function memoryRecall() {
    currentInput = memory.toString();
    updateDisplay();
    showMemoryOperation('MR: ' + memory);
}

function memoryClear() {
    memory = 0;
    showMemoryOperation('MC: Memory Cleared');
}

function memoryAdd() {
    try {
        memory += parseFloat(currentInput);
        showMemoryOperation('M+: ' + memory);
    } catch (error) {
        showMemoryOperation('Memory Error');
    }
}

function showMemoryOperation(message) {
    const originalSecondary = secondaryDisplay.textContent;
    secondaryDisplay.textContent = message;
    secondaryDisplay.style.color = '#22c55e';
    
    setTimeout(() => {
        secondaryDisplay.textContent = originalSecondary;
        secondaryDisplay.style.color = '#94a3b8';
    }, 1500);
}

// History functions
function addToHistory(expr, result) {
    const historyItem = {
        expression: expr,
        result: result,
        timestamp: new Date().toLocaleTimeString()
    };
    
    history.unshift(historyItem);
    
    // Keep only last 10 calculations
    if (history.length > 10) {
        history.pop();
    }
    
    updateHistoryDisplay();
    saveHistory();
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    history.forEach((item, index) => {
        const historyElement = document.createElement('div');
        historyElement.className = 'history-item';
        historyElement.innerHTML = `
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        `;
        
        historyElement.addEventListener('click', () => {
            currentInput = item.result.toString();
            expression = '';
            updateDisplay();
        });
        
        historyList.appendChild(historyElement);
    });
}

function clearHistory() {
    history = [];
    updateHistoryDisplay();
    saveHistory();
}

function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
}

function loadHistory() {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Numbers
    if (key >= '0' && key <= '9') {
        insertNumber(key);
    }
    // Operators
    else if (key === '+') {
        insertOperator('+');
    }
    else if (key === '-') {
        insertOperator('-');
    }
    else if (key === '*') {
        insertOperator('*');
    }
    else if (key === '/') {
        event.preventDefault();
        insertOperator('/');
    }
    else if (key === '.') {
        insertOperator('.');
    }
    else if (key === '(' || key === ')') {
        insertOperator(key);
    }
    // Functions
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    }
    else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearAll();
    }
    else if (key === 'Backspace') {
        deleteLast();
    }
});

// Advanced mathematical functions
function calculateAdvanced(operation) {
    try {
        const num = parseFloat(currentInput);
        let result;
        
        switch (operation) {
            case 'sin':
                result = Math.sin(num * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(num * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(num * Math.PI / 180);
                break;
            case 'log':
                result = Math.log10(num);
                break;
            case 'ln':
                result = Math.log(num);
                break;
            case 'sqrt':
                result = Math.sqrt(num);
                break;
            default:
                throw new Error('Unknown operation');
        }
        
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Invalid result');
        }
        
        addToHistory(operation + '(' + num + ')', result);
        currentInput = result.toString();
        expression = '';
        updateDisplay();
        
    } catch (error) {
        currentInput = 'Error';
        updateDisplay();
        setTimeout(() => {
            currentInput = '0';
            updateDisplay();
        }, 2000);
    }
}

// Add visual feedback for button presses
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
});

// Add animation to display when calculating
function animateCalculation() {
    mainDisplay.classList.add('calculating');
    setTimeout(() => {
        mainDisplay.classList.remove('calculating');
    }, 500);
}

// Theme integration
function applyTheme() {
    document.body.style.setProperty('--primary-color', '#3b82f6');
    document.body.style.setProperty('--secondary-color', '#8b5cf6');
    document.body.style.setProperty('--success-color', '#22c55e');
    document.body.style.setProperty('--error-color', '#ef4444');
}

// Initialize theme
applyTheme();
