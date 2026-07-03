class JarimatikaChatbot {
    constructor() {
        this.context = {
            lastQuery: null,
            lastResult: null,
            conversation: []
        };
        
        // Knowledge base for Jarimatika
        this.knowledgeBase = {
            'apa itu jarimatika': 'Jarimatika adalah metode berhitung menggunakan jari tangan. Tangan kanan untuk satuan (1-9) dan tangan kiri untuk puluhan (10-90).',
            'cara menghitung jarimatika': 'Cara menghitung dengan Jarimatika:\n- Tangan kanan: jari terbuka = angka 1-5, jari tertutup = angka 6-9\n- Tangan kiri: jari terbuka = puluhan 10-50, jari tertutup = puluhan 60-90\nContoh: 7 = tutup 3 jari (10-7=3)',
            'tangan kanan': 'Tangan kanan digunakan untuk satuan. Angka 1-5: buka jari sesuai angka. Angka 6-9: tutup jari sesuai selisih dari 10.',
            'tangan kiri': 'Tangan kiri digunakan untuk puluhan. Angka 10-50: buka jari sesuai puluhan/10. Angka 60-90: tutup jari sesuai selisih dari 10.',
            'contoh jarimatika': 'Contoh perhitungan:\n- 7 + 8 = 15\n  Tangan kanan: 7 (tutup 3 jari) + 8 (tutup 2 jari) = 15\n- 15 - 7 = 8\n  Tangan kanan: 15 (1 jari kiri + 5 jari kanan) - 7 = 8',
        };
        
        this.greetings = ['hai', 'halo', 'hello', 'selamat pagi', 'selamat sore', 'selamat malam'];
        this.farewells = ['terima kasih', 'makasih', 'thanks', 'bye', 'sampai jumpa', 'dadah'];
    }

    getResponse(message) {
        const lowerMsg = message.toLowerCase().trim();
        
        // Check for greetings
        if (this.isGreeting(lowerMsg)) {
            return this.getGreetingResponse();
        }
        
        // Check for farewells
        if (this.isFarewell(lowerMsg)) {
            return this.getFarewellResponse();
        }
        
        // Check for mathematical expression
        if (this.isMathExpression(lowerMsg)) {
            return this.handleMathExpression(message);
        }
        
        // Check knowledge base
        for (const [key, value] of Object.entries(this.knowledgeBase)) {
            if (lowerMsg.includes(key)) {
                return value;
            }
        }
        
        // Check for finger counting question
        if (this.isFingerQuestion(lowerMsg)) {
            return this.handleFingerQuestion(message);
        }
        
        // Default response
        return this.getDefaultResponse(message);
    }

    isGreeting(message) {
        return this.greetings.some(greeting => message.includes(greeting));
    }

    isFarewell(message) {
        return this.farewells.some(farewell => message.includes(farewell));
    }

    isMathExpression(message) {
        // Check for mathematical operations
        const mathPatterns = [
            /[\d]+\s*[+\-×÷]\s*[\d]+/,
            /[\d]+\s*tambah\s*[\d]+/,
            /[\d]+\s*kurang\s*[\d]+/,
            /[\d]+\s*kali\s*[\d]+/,
            /[\d]+\s*bagi\s*[\d]+/
        ];
        return mathPatterns.some(pattern => pattern.test(message));
    }

    isFingerQuestion(message) {
        const fingerPatterns = [
            /jari.*(berapa|jumlah)/,
            /(berapa|jumlah).*jari/,
            /angka.*jari/,
            /jari.*angka/
        ];
        return fingerPatterns.some(pattern => pattern.test(message));
    }

    handleMathExpression(message) {
        // Extract numbers and operator
        let expression = message.replace(/tambah/g, '+')
                               .replace(/kurang/g, '-')
                               .replace(/kali/g, '×')
                               .replace(/bagi/g, '÷');
        
        // Find numbers and operator
        const match = expression.match(/(\d+)\s*([+\-×÷])\s*(\d+)/);
        if (match) {
            const num1 = parseInt(match[1]);
            const operator = match[2];
            const num2 = parseInt(match[3]);
            
            let result;
            switch (operator) {
                case '+':
                    result = num1 + num2;
                    break;
                case '-':
                    result = num1 - num2;
                    break;
                case '×':
                    result = num1 * num2;
                    break;
                case '÷':
                    if (num2 === 0) return 'Maaf, tidak bisa membagi dengan 0.';
                    result = num1 / num2;
                    break;
                default:
                    return 'Maaf, saya tidak mengerti operasi ini.';
            }
            
            return `Hasil dari ${num1} ${operator} ${num2} adalah ${result}.`;
        }
        
        return 'Maaf, saya tidak bisa menghitung ekspresi ini. Coba tulis seperti "8+7" atau "15-6".';
    }

    handleFingerQuestion(message) {
        const numbers = message.match(/\d+/g);
        if (numbers && numbers.length > 0) {
            const num = parseInt(numbers[0]);
            if (num >= 0 && num <= 99) {
                const handInfo = this.getHandInfo(num);
                return `Untuk menunjukkan angka ${num}:\n${handInfo}`;
            }
        }
        return 'Untuk menghitung dengan jari, gunakan tangan kanan untuk satuan (1-9) dan tangan kiri untuk puluhan.';
    }

    getHandInfo(number) {
        if (number >= 0 && number <= 9) {
            return `Tangan kanan: ${this.getFingerCount(number)} jari terbuka.`;
        } else if (number >= 10 && number <= 99) {
            const tens = Math.floor(number / 10);
            const ones = number % 10;
            let info = `Tangan kiri: ${this.getFingerCount(tens)} jari terbuka (${tens}0-an).\n`;
            info += `Tangan kanan: ${this.getFingerCount(ones)} jari terbuka (${ones})`;
            return info;
        }
        return 'Angka di luar jangkauan (0-99)';
    }

    getFingerCount(number) {
        if (number === 0) return 0;
        if (number <= 5) return number;
        return 10 - number;
    }

    getGreetingResponse() {
        const responses = [
            'Halo! Selamat datang di Jarimatika App. Ada yang bisa saya bantu?',
            'Hai! Saya asisten Jarimatika. Tanyakan tentang berhitung dengan jari!',
            'Selamat datang! Bagaimana saya bisa membantu Anda belajar Jarimatika?'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getFarewellResponse() {
        const responses = [
            'Sama-sama! Semangat belajar Jarimatika! 👋',
            'Terima kasih sudah bertanya. Selamat belajar! 🌟',
            'Senang bisa membantu. Praktikkan terus Jarimatika ya! 💪'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getDefaultResponse(message) {
        const responses = [
            'Maaf, saya belum mengerti. Coba tanyakan tentang Jarimatika atau berhitung dengan jari.',
            'Saya masih belajar. Pertanyaan yang lebih spesifik tentang Jarimatika?',
            'Coba tanyakan cara menghitung dengan jari atau operasi matematika sederhana.',
            'Untuk belajar Jarimatika, saya bisa jelaskan cara menggunakan jari untuk berhitung.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Integration with calculator
    processCalculation(expression) {
        const calculator = new JarimatikaCalculator();
        return calculator.evaluateExpression(expression);
    }
}

export default JarimatikaChatbot;