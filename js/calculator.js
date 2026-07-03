class JarimatikaCalculator {
    constructor() {
        this.display = '0';
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.detectedNumber = null;
        this.history = [];
        this.maxHistory = 10;
    }

    // Handle input from button clicks or detected number
    handleInput(value) {
        if (value === 'C') {
            this.clear();
            return;
        }

        if (value === '=') {
            this.calculate();
            return;
        }

        // Operator
        if (['+', '-', '×', '÷'].includes(value)) {
            this.handleOperator(value);
            return;
        }

        // Number input
        this.handleNumber(value);
    }

    handleNumber(value) {
        if (this.waitingForOperand) {
            this.currentValue = value;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? value : this.currentValue + value;
        }
        this.updateDisplay();
    }

    handleOperator(operator) {
        const current = parseFloat(this.currentValue);
        
        if (this.previousValue !== null && !this.waitingForOperand) {
            this.calculate();
        }

        this.previousValue = current;
        this.operation = operator;
        this.waitingForOperand = true;
        this.currentValue = '0';
    }

    calculate() {
        if (this.previousValue === null || this.operation === null) {
            return;
        }

        const prev = this.previousValue;
        const curr = parseFloat(this.currentValue);
        let result = 0;

        switch (this.operation) {
            case '+':
                result = prev + curr;
                break;
            case '-':
                result = prev - curr;
                break;
            case '×':
                result = prev * curr;
                break;
            case '÷':
                if (curr === 0) {
                    this.currentValue = 'Error: Bagi 0';
                    this.updateDisplay();
                    this.clear();
                    return;
                }
                result = prev / curr;
                break;
            default:
                return;
        }

        // Add to history
        this.addToHistory(prev, this.operation, curr, result);

        this.currentValue = String(Math.round(result * 100) / 100);
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.updateDisplay();
    }

    addToHistory(prev, op, curr, result) {
        const entry = {
            expression: `${prev} ${op} ${curr} = ${result}`,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        };
        this.history.unshift(entry);
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }
    }

    getHistory() {
        return this.history;
    }

    clear() {
        this.display = '0';
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.detectedNumber = null;
        this.updateDisplay();
    }

    setDetectedNumber(number) {
        this.detectedNumber = number;
        if (this.detectedNumber !== null && !this.waitingForOperand) {
            // Auto-insert detected number if not waiting for operand
            this.currentValue = String(this.detectedNumber);
            this.updateDisplay();
        }
    }

    getDisplay() {
        return this.display;
    }

    updateDisplay() {
        let displayValue = this.currentValue;
        
        // Show operation and previous value if any
        if (this.previousValue !== null && this.operation !== null) {
            displayValue = `${this.previousValue} ${this.operation} ${this.currentValue}`;
        }
        
        // Show detected number if available and not in calculation
        if (this.detectedNumber !== null && this.previousValue === null && !this.waitingForOperand) {
            displayValue = `👋 ${this.detectedNumber}`;
        }

        this.display = displayValue;
        
        // Trigger display update event
        if (this.onDisplayUpdate) {
            this.onDisplayUpdate(this.display);
        }
    }

    // Event callback for display updates
    onDisplayUpdate(callback) {
        this.onDisplayUpdate = callback;
    }

    // Get result for chatbot integration
    evaluateExpression(expression) {
        try {
            // Clean expression
            const cleanExpr = expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/=/g, '');
            
            // Safe evaluation using Function constructor (with limited scope)
            const result = new Function(`return (${cleanExpr})`)();
            
            if (isNaN(result) || !isFinite(result)) {
                return { error: 'Hasil tidak valid' };
            }
            
            return { result: Math.round(result * 100) / 100 };
        } catch (error) {
            return { error: 'Format perhitungan salah' };
        }
    }

    // Auto-calculate detected number sequence
    autoCalculate(operation, number1, number2) {
        const num1 = parseInt(number1);
        const num2 = parseInt(number2);
        
        if (isNaN(num1) || isNaN(num2)) {
            return { error: 'Harap gunakan angka yang valid' };
        }

        let result;
        switch (operation) {
            case 'tambah':
            case '+':
                result = num1 + num2;
                break;
            case 'kurang':
            case '-':
                result = num1 - num2;
                break;
            case 'kali':
            case '×':
                result = num1 * num2;
                break;
            case 'bagi':
            case '÷':
                if (num2 === 0) return { error: 'Tidak bisa membagi dengan 0' };
                result = num1 / num2;
                break;
            default:
                return { error: 'Operasi tidak dikenal' };
        }

        return { result: Math.round(result * 100) / 100 };
    }
}

export default JarimatikaCalculator;