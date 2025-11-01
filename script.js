// State management
let currentMethod = null;
let currentStep = 0;
let userInput = null;
let savedTimes = JSON.parse(localStorage.getItem('savedTimes')) || [];
let friends = JSON.parse(localStorage.getItem('friends')) || [];
let calendarCurrentMonth = new Date().getMonth();
let calendarCurrentYear = new Date().getFullYear();
let selectedCalendarDate = null;

// Database functions are in database.js file

// Timer state
let timerRunning = false;
let timerStartTime = 0;
let timerInterval = null;
let currentTime = 0;
let isSaving = false; // Track if save is in progress to prevent duplicates

// Methods and their steps
const methods = {
    beginner: {
        name: 'Метод для новичков',
        steps: [
            {
                name: 'Крест на первой стороне',
                description: 'Соберите крест на одной стороне кубика. Крест состоит из 4 краевых (рёберных) элементов, которые должны совпадать с центральными элементами боковых граней. Например, если собираете крест белого цвета, то каждое ребро креста должно совпадать по цвету с центром боковой грани.',
                detailedDescription: 'ПОШАГОВАЯ ИНСТРУКЦИЯ:\n\n1. Выберите цвет для креста (обычно белый)\n2. Найдите 4 краевых элемента с этим цветом\n3. Для каждого элемента:\n   - Если элемент находится в верхнем слое, но не на своем месте: U или U\', чтобы повернуть его под нужное место\n   - Если элемент в среднем слое: используйте R U R\' или F\' U\' F, чтобы вывести его\n   - Если элемент в нижнем слое: поверните нижний слой (D или D\'), чтобы поставить элемент под нужное место, затем поднимите его\n4. Когда элемент стоит над нужным местом, поверните эту грань на 180° (F2, R2 и т.д.)\n5. Важно: каждый элемент креста должен совпадать с центром боковой грани!',
                algorithms: [
                    'Элемент в среднем слое справа: R U R\'',
                    'Элемент в среднем слое слева: F\' U\' F',
                    'Элемент внизу: поверните нижний слой D или D\', затем используйте F2, R2 и т.д.',
                    'Если элемент не встает правильно, попробуйте предварительно вывести его за 1-2 хода'
                ]
            },
            {
                name: 'Первый слой (уголки)',
                description: 'Завершите сборку первого слоя, расставив угловые элементы. После сборки креста нужно поставить 4 угловых элемента на свои места. Каждый уголок имеет 3 цвета и должен совпадать с центрами трех граней.',
                detailedDescription: 'ПОШАГОВАЯ ИНСТРУКЦИЯ (ПЕРВЫЙ СЛОЙ - УГОЛКИ):\n\nПосле того как крест собран, нужно поставить 4 угловых элемента на свои места.\n\nКАК НАЙТИ ПРАВИЛЬНЫЙ УГОЛОК:\n- Уголок должен иметь 3 цвета: цвет креста (например, белый), и цвета двух боковых центров\n- Например, если собираете белый крест, уголок должен иметь белый, красный и синий цвета\n\nСИТУАЦИИ И РЕШЕНИЯ:\n\n1. Уголок внизу лицом вниз:\n   Алгоритм: R U R\'\n   - Поверните правую грань вверх (R)\n   - Поверните верхний слой влево (U)\n   - Верните правую грань вниз (R\')\n\n2. Уголок внизу лицом влево:\n   Алгоритм: F\' U\' F\n   - Поверните переднюю грань против часовой (F\')\n   - Поверните верхний слой вправо (U\')\n   - Верните переднюю грань (F)\n\n3. Уголок внизу лицом вправо:\n   Алгоритм: R\' F R F\'\n   - Поверните правую грань против часовой (R\')\n   - Поверните переднюю грань по часовой (F)\n   - Верните правую грань (R)\n   - Верните переднюю грань против часовой (F\')\n\n4. Уголок уже на месте, но неправильно повернут:\n   Используйте любой из алгоритмов выше, чтобы вывести его, затем поставьте правильно\n\n5. Уголок в верхнем слое, но не на своем месте:\n   Сначала выведите его вниз одним из алгоритмов, затем поставьте правильно\n\nВАЖНО:\n- После каждого уголка проверяйте, что он совпадает с тремя центрами\n- Не торопитесь, убедитесь, что уголок стоит правильно\n- Если уголок не встает, попробуйте вывести его и поставить заново',
                algorithms: [
                    'Уголок внизу лицом вниз: R U R\'',
                    'Уголок внизу лицом влево: F\' U\' F',
                    'Уголок внизу лицом вправо: R\' F R F\'',
                    'Если уголок уже на месте, но неправильно повернут: используйте любой алгоритм, чтобы вывести его, затем поставьте правильно',
                    'Если уголок в верхнем слое: выведите его вниз одним из алгоритмов, затем поставьте правильно'
                ]
            },
            {
                name: 'Второй слой',
                description: 'Соберите средний слой, вставив краевые элементы.',
                algorithms: [
                    'Элемент надолжен выйти: U R U\' R\' U\' F\' U F',
                    'Элемент влево: U\' L\' U L U F U\' F\''
                ]
            },
            {
                name: 'Крест сверху',
                description: 'Соберите крест на последнем слое.',
                algorithms: [
                    'Если одна полоса: F R U R\' U\' F\'',
                    'Если угловая форма: поверните: F R U R\' U\' F\'',
                    'Если точка: повторяйте до появления креста'
                ]
            },
            {
                name: 'Финал',
                description: 'Расположите углы правильно.',
                algorithms: [
                    'Поставьте один угол на место, поверните верхним слоем на R U R\' F\' R U R\' U\' R\' F R2 U\' R\'',
                    'Двигайте углы по очереди пока все не встанут'
                ]
            }
        ]
    },
    fridrich: {
        name: 'Метод Фридриха (CFOP)',
        steps: [
            {
                name: 'Cross (Крест)',
                description: 'Соберите крест на одной стороне кубика максимально эффективно. Это первый и самый важный шаг CFOP метода.',
                detailedDescription: 'ПОШАГОВАЯ ИНСТРУКЦИЯ (CROSS):\n\nCross - это основа CFOP метода. Ваша задача собрать 4 ребра креста так, чтобы каждый из них совпадал с боковыми центрами.\n\nПОЧЕМУ ЭТО ВАЖНО:\n- Правильный крест экономит 10-15 ходов в решении\n- Хороший cross - залог быстрой сборки\n- Цель: собрать за 7-8 ходов\n\nКАК ПРАКТИКОВАТЬ:\n1. Выполните скрамбл\n2. Посмотрите на кубик и ДУМАЙТЕ, не торопитесь крутить\n3. Найдите 2 ребра креста, которые можно поставить одновременно\n4. Составьте план первых 3-4 ходов\n5. Выполните план без пауз\n\nЧАСТЫЕ ОШИБКИ:\n- Собирают крест без учета боковых центров\n- Делают лишние ходы U, U\'\n- Не планируют заранее\n\nЦЕЛЬ: Автоматически видеть несколько ходов вперед и собирать крест в оптимальной последовательности.',
                algorithms: [
                    'Если ребро уже на месте: не трогайте его',
                    'Если ребро в верхнем слое: U или U\', затем F2/R2/L2/B2',
                    'Если ребро в нижнем слое: поверните кубик так, чтобы поставить ребро, затем поднимите',
                    'Если ребро в среднем слое: F\' U\' F или R U R\'',
                    'СОВЕТ: Старайтесь собирать крест за 6-8 ходов максимум!'
                ]
            },
            {
                name: 'F2L (First Two Layers)',
                description: 'Соберите первые два слоя одновременно, сопоставляя края и углы.',
                algorithms: [
                    'Case 1: R U\' R\'',
                    'Case 2: F\' U\' F',
                    'Case 3: U R U\' R\' U\' F\' U F',
                    'Case 4: U\' L\' U L U F U\' F\'',
                    'Используйте зеркальные случаи для правой стороны'
                ]
            },
            {
                name: 'OLL (Orientation of Last Layer)',
                description: 'Ориентируйте последний слой (разверните элементы верхнего креста).',
                algorithms: [
                    'Первый крест: F R U R\' U\' F\' f R U R\' U\' f\'',
                    'T-shape: F R U R\' U\' F\'',
                    'L-shape: f R U R\' U\' f\' F R U R\' U\' F\'',
                    'И другие 57 случаев OLL'
                ]
            },
            {
                name: 'PLL (Permutation of Last Layer)',
                description: 'Переставьте элементы последнего слоя.',
                algorithms: [
                    'PLL T-пермутация: R U R\' F\' R U R\' U\' R\' F R2 U\' R\'',
                    'PLL J-пермутация: L\' U R\' z R2 U R\' D R U\'',
                    'PLL A-пермутация: x R2 D2 (R\' U\' R) D2 (R\' U R\')',
                    'И другие 21 случай PLL'
                ]
            }
        ]
    }
};

// Initialize
function startMethod(method) {
    currentMethod = method;
    currentStep = 0;
    const welcomeScreen = document.getElementById('welcomeScreen');
    const chatContainer = document.getElementById('chatContainer');
    
    // Smooth transition
    welcomeScreen.style.opacity = '0';
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        chatContainer.style.display = 'flex';
        chatContainer.style.opacity = '0';
        setTimeout(() => {
            chatContainer.style.transition = 'opacity 0.3s ease';
            chatContainer.style.opacity = '1';
        }, 50);
    }, 300);
    
    const methodName = methods[method].name;
    const methodIndicator = document.getElementById('methodIndicator');
    if (methodIndicator) {
        methodIndicator.textContent = `Метод: ${methodName} | Шаг: ${currentStep + 1} из ${methods[method].steps.length}`;
    }
    
    // Update profile method
    const modalProfileMethod = document.getElementById('modalProfileMethod');
    if (modalProfileMethod) {
        modalProfileMethod.textContent = methodName;
    }
    
    // First send helpful commands message
    addMessage('ai', `💡 **Полезные команды:**\n• "далее" или "next" - следующий шаг\n• "алгоритм" - показать алгоритмы\n• "помощь" - показать справку`);
    
    // Add "пиф-паф" algorithm message
    setTimeout(() => {
        addMessage('ai', `📐 **Алгоритм "пиф-паф":**\n• Для правой стороны: **R U R' U'**\n• Для левой стороны: **L' U' L U**\n\nЭтот базовый алгоритм часто используется для перемещения элементов!`);
    }, 300);
    
    // Then send the main message with current step
    setTimeout(() => {
        addMessage('ai', `Привет! Я помогу тебе собрать кубик Рубика используя метод "${methodName}". ${getCurrentStepDescription()}`);
    }, 800);
    
    // Update step selector dropdown
    updateStepSelector();
    
    // Add chat-active class to container
    document.querySelector('.container').classList.add('chat-active');
}

function getCurrentStepDescription() {
    const step = methods[currentMethod].steps[currentStep];
    return `\n\n📌 Текущий шаг: **${step.name}**\n\n${step.description}`;
}

function sendMessage() {
    const input = document.getElementById('userInput');
    userInput = input.value.trim();
    
    if (!userInput) return;
    
    addMessage('user', userInput);
    input.value = '';
    
    // Process user input
    setTimeout(() => {
        processUserInput(userInput);
    }, 500);
}

function processUserInput(input) {
    const lowerInput = input.toLowerCase();
    
    // Navigation commands
    if (lowerInput.includes('следующ') || lowerInput.includes('next') || lowerInput.includes('далее')) {
        nextStep();
        return;
    }
    
    if (lowerInput.includes('предыдущ') || lowerInput.includes('previous') || lowerInput.includes('назад')) {
        previousStep();
        return;
    }
    
    if (lowerInput.includes('текущ') || lowerInput.includes('current') || lowerInput.includes('покаж')) {
        showCurrentStep();
        return;
    }
    
    if (lowerInput.includes('алгоритм') || lowerInput.includes('algorithm')) {
        showAlgorithms();
        return;
    }
    
    if (lowerInput.includes('нач') || lowerInput.includes('start') || lowerInput.includes('reset')) {
        resetToBeginning();
        return;
    }
    
    if (lowerInput.includes('помощь') || lowerInput.includes('help')) {
        showHelp();
        return;
    }
    
    // General responses
    if (lowerInput.includes('привет') || lowerInput.includes('hello') || lowerInput.includes('hi')) {
        addMessage('ai', `Привет! Я готов помочь со сборкой кубика. ${getCurrentStepDescription()}`);
    } else if (lowerInput.includes('спасибо') || lowerInput.includes('thank')) {
        addMessage('ai', 'Пожалуйста! Удачи в сборке! 🎯');
    } else if (lowerInput.includes('готов') || lowerInput.includes('done') || lowerInput.includes('заверш')) {
        checkCompletion();
    } else {
        addMessage('ai', `${getCurrentStepDescription()}\n\n💡 Полезные команды:\n• "далее" или "next" - следующий шаг\n• "алгоритм" - показать алгоритмы\n• "помощь" - показать справку`);
    }
}

function nextStep() {
    if (currentStep < methods[currentMethod].steps.length - 1) {
        currentStep++;
        const methodIndicator = document.getElementById('methodIndicator');
        if (methodIndicator) {
            methodIndicator.textContent = `Метод: ${methods[currentMethod].name} | Шаг: ${currentStep + 1} из ${methods[currentMethod].steps.length}`;
        }
        
        // Update step selector
        updateStepSelector();
        
        const step = methods[currentMethod].steps[currentStep];
        addMessage('ai', `✅ Переход к шагу ${currentStep + 1}:\n\n📌 **${step.name}**\n\n${step.description}`);
    } else {
        addMessage('ai', '🎉 Поздравляю! Вы завершили все шаги! Кубик должен быть собран. Если нет, дайте знать, и я помогу разобраться с проблемой.');
    }
}

function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        const methodIndicator = document.getElementById('methodIndicator');
        if (methodIndicator) {
            methodIndicator.textContent = `Метод: ${methods[currentMethod].name} | Шаг: ${currentStep + 1} из ${methods[currentMethod].steps.length}`;
        }
        
        // Update step selector
        updateStepSelector();
        
        const step = methods[currentMethod].steps[currentStep];
        addMessage('ai', `⬅️ Возврат к шагу ${currentStep + 1}:\n\n📌 **${step.name}**\n\n${step.description}`);
    } else {
        addMessage('ai', 'Вы уже на первом шаге.');
    }
}

function showCurrentStep() {
    addMessage('ai', getCurrentStepDescription());
}

function showAlgorithms() {
    const step = methods[currentMethod].steps[currentStep];
    let message = `📐 Алгоритмы для текущего шага:\n\n**${step.name}**\n\n`;
    
    // Include detailed description if available
    if (step.detailedDescription) {
        message += `${step.detailedDescription}\n\n`;
    }
    
    message += `**Алгоритмы:**\n`;
    step.algorithms.forEach((alg, index) => {
        message += `${index + 1}. ${alg}\n`;
    });
    
    addMessage('ai', message);
}

function showHelp() {
    const helpText = `📚 Справка по Cubick AI\n\n` +
        `**Доступные команды:**\n` +
        `• "далее" или "next" - перейти к следующему шагу\n` +
        `• "назад" или "previous" - вернуться к предыдущему шагу\n` +
        `• "алгоритм" - показать алгоритмы для текущего шага\n` +
        `• "текущий шаг" - повторить информацию о текущем шаге\n` +
        `• "помощь" - показать эту справку\n` +
        `• "начать заново" - сбросить к первому шагу\n\n` +
        `**Обозначения:**\n` +
        `• R/L/F/B/U/D - поворот по часовой (Right/Left/Front/Back/Up/Down)\n` +
        `• R'/L'/F'/B'/U'/D' - поворот против часовой стрелки\n` +
        `• R2/L2/F2/B2/U2/D2 - двойной поворот\n\n` +
        `Удачи в сборке! 🎯`;
    
    addMessage('ai', helpText);
}

function checkCompletion() {
    if (currentStep === methods[currentMethod].steps.length - 1) {
        addMessage('ai', '🎉 Отлично! Вы прошли все шаги. Кубик должен быть собран полностью! Поздравляю! 🎊');
    } else {
        addMessage('ai', `Вы на шаге ${currentStep + 1} из ${methods[currentMethod].steps.length}. Продолжайте работу! 💪`);
    }
}

function resetToBeginning() {
    currentStep = 0;
    const methodIndicator = document.getElementById('methodIndicator');
    if (methodIndicator) {
        methodIndicator.textContent = `Метод: ${methods[currentMethod].name} | Шаг: ${currentStep + 1} из ${methods[currentMethod].steps.length}`;
    }
    
    // Update step selector
    updateStepSelector();
    
    const step = methods[currentMethod].steps[currentStep];
    addMessage('ai', `🔄 Начинаем заново!\n\n📌 Шаг 1: **${step.name}**\n\n${step.description}`);
}

function quickPrompt(action) {
    switch(action) {
        case 'scramble':
            generateScramble();
            break;
        case 'reset':
            resetToBeginning();
            break;
    }
}

function updateStepSelector() {
    const stepSelector = document.getElementById('stepSelector');
    if (!stepSelector || !currentMethod) return;
    
    stepSelector.innerHTML = '<option value="">Выберите шаг...</option>';
    
    methods[currentMethod].steps.forEach((step, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index + 1}. ${step.name}`;
        if (index === currentStep) {
            option.selected = true;
        }
        stepSelector.appendChild(option);
    });
}

function selectStepFromDropdown() {
    const stepSelector = document.getElementById('stepSelector');
    if (!stepSelector || !currentMethod) return;
    
    const selectedIndex = parseInt(stepSelector.value);
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= methods[currentMethod].steps.length) {
        return;
    }
    
    currentStep = selectedIndex;
    const methodIndicator = document.getElementById('methodIndicator');
    if (methodIndicator) {
        methodIndicator.textContent = `Метод: ${methods[currentMethod].name} | Шаг: ${currentStep + 1} из ${methods[currentMethod].steps.length}`;
    }
    
    const step = methods[currentMethod].steps[currentStep];
    addMessage('ai', `📌 **Шаг ${currentStep + 1}: ${step.name}**\n\n${step.description}`);
}

function generateScramble() {
    const moves = ['R', 'L', 'F', 'B', 'U', 'D'];
    const modifiers = ['', '\'', '2'];
    const scrambleLength = Math.floor(Math.random() * 6) + 15; // Random between 15-20
    
    let scramble = '';
    let lastMove = '';
    
    for (let i = 0; i < scrambleLength; i++) {
        let move = '';
        do {
            move = moves[Math.floor(Math.random() * moves.length)];
        } while (move === lastMove || move[0] === lastMove[0]);
        
        lastMove = move;
        const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
        scramble += move + modifier + ' ';
    }
    
    addMessage('ai', `🎲 Сгенерированный скрамбл:\n\n\`\`\`${scramble}\`\`\`\n\nСоберите кубик по этому скрамблу для практики!`);
}

function addMessage(sender, text) {
    const messagesDiv = document.getElementById('chatMessages');
    const inputWrapper = messagesDiv.querySelector('.chat-input-wrapper');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Format text with markdown-like syntax
    let formattedText = formatText(text);
    
    contentDiv.innerHTML = formattedText;
    
    const timestamp = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'message-timestamp';
    timestampDiv.textContent = timestamp;
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timestampDiv);
    
    // Insert message before input wrapper, or append if wrapper doesn't exist
    if (inputWrapper) {
        messagesDiv.insertBefore(messageDiv, inputWrapper);
    } else {
        messagesDiv.appendChild(messageDiv);
    }
    
    // Scroll to show the input area (smooth scroll)
    setTimeout(() => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 100);
}

function formatText(text) {
    // Convert markdown-like syntax to HTML
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">$1</code>');
    
    return text;
}

// Compact Menu functions
function toggleSidebar() {
    const compactMenu = document.getElementById('compactMenu');
    if (compactMenu.style.display === 'none' || !compactMenu.style.display) {
        compactMenu.style.display = 'block';
        document.body.classList.add('no-scroll');
    } else {
        compactMenu.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }
}

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    const compactMenu = document.getElementById('compactMenu');
    const hamburger = document.querySelector('.hamburger-menu');
    if (compactMenu && compactMenu.style.display === 'block' && 
        !compactMenu.contains(e.target) && 
        !hamburger.contains(e.target)) {
        compactMenu.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }
});

// Home navigation with smooth transition
function goHome() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const chatContainer = document.getElementById('chatContainer');
    const timerSection = document.getElementById('timerSection');
    const compactMenu = document.getElementById('compactMenu');
    const container = document.querySelector('.container');
    
    // Remove chat-active class
    if (container) {
        container.classList.remove('chat-active');
    }
    
    // Close menu if open
    if (compactMenu) {
        compactMenu.style.display = 'none';
    }
    
    // Smooth fade out
    if (chatContainer.style.display !== 'none') {
        chatContainer.style.opacity = '0';
        setTimeout(() => {
            chatContainer.style.display = 'none';
            chatContainer.style.opacity = '1';
        }, 300);
    }
    
    if (timerSection.style.display !== 'none') {
        timerSection.style.opacity = '0';
        setTimeout(() => {
            timerSection.style.display = 'none';
            timerSection.style.opacity = '1';
        }, 300);
    }
    
    // Smooth fade in
    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.display = 'block';
    setTimeout(() => {
        welcomeScreen.style.transition = 'opacity 0.3s ease';
        welcomeScreen.style.opacity = '1';
    }, 50);
    
    currentMethod = null;
    currentStep = 0;
}

// Helper function to get date string in format DD.MM.YYYY
function getDateString(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

// Time management
function saveTime() {
    const timeInput = document.getElementById('timeInput');
    const time = parseFloat(timeInput.value);
    
    if (isNaN(time) || time <= 0) {
        alert('Пожалуйста, введите корректное время');
        return;
    }
    
    const now = new Date();
    const timeObj = {
        time: time,
        dateString: getDateString(now),
        fullDate: now.toLocaleString('ru-RU'),
        timestamp: now.getTime(),
        method: currentMethod || 'none'
    };
    
    savedTimes.push(timeObj);
    savedTimes.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
    
    localStorage.setItem('savedTimes', JSON.stringify(savedTimes));
    
    updateTimeList();
    timeInput.value = '';
}

function saveTimerTime() {
    const saveBtn = document.querySelector('.save-timer-btn');
    
    // Prevent multiple saves
    if (isSaving) {
        return;
    }
    
    // Early validation
    if (currentTime === 0) {
        alert('Сначала запустите секундомер и измерьте время!');
        return;
    }
    
    if (timerRunning) {
        alert('Остановите секундомер перед сохранением!');
        return;
    }
    
    const timeInSeconds = currentTime / 100; // Convert centiseconds to seconds
    const now = new Date();
    
    // Set saving flag
    isSaving = true;
    
    // Add green class for animation
    if (saveBtn) {
        saveBtn.classList.add('saving');
    }
    
    const timeObj = {
        time: timeInSeconds,
        dateString: getDateString(now),
        fullDate: now.toLocaleString('ru-RU'),
        timestamp: now.getTime(),
        method: 'timer'
    };
    
    savedTimes.push(timeObj);
    savedTimes.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
    
    localStorage.setItem('savedTimes', JSON.stringify(savedTimes));
    
    // Update all time lists
    updateTimeList();
    updateTodayTimes();
    
    // Remove green class and reset flag after animation
    setTimeout(() => {
        if (saveBtn) {
            saveBtn.classList.remove('saving');
        }
        isSaving = false;
    }, 1500);
}

function updateTimeList() {
    const timeList = document.getElementById('timeList');
    
    if (savedTimes.length === 0) {
        timeList.innerHTML = '<p style="color: rgba(255,255,255,0.5); font-size: 0.9rem;">Сохраненные результаты покажутся здесь</p>';
        return;
    }
    
    timeList.innerHTML = '';
    
    // Group times by date
    const timesByDate = {};
    savedTimes.forEach(item => {
        const dateKey = item.dateString || getDateString(new Date(item.timestamp || Date.now()));
        if (!timesByDate[dateKey]) {
            timesByDate[dateKey] = [];
        }
        timesByDate[dateKey].push(item);
    });
    
    // Sort dates (newest first)
    const sortedDates = Object.keys(timesByDate).sort((a, b) => {
        const dateA = a.split('.').reverse().join('-');
        const dateB = b.split('.').reverse().join('-');
        return new Date(dateB) - new Date(dateA);
    });
    
    // Display grouped by date
    sortedDates.forEach(dateKey => {
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        dateHeader.textContent = dateKey;
        timeList.appendChild(dateHeader);
        
        const timesForDate = timesByDate[dateKey];
        // Sort times within date (best time first)
        timesForDate.sort((a, b) => a.time - b.time);
        
        timesForDate.forEach((item, index) => {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'time-item';
            
            const rank = index + 1;
            const trophy = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            
            const timeStr = item.time.toFixed(2);
            timeDiv.innerHTML = `
                <span>${trophy} ${item.fullDate || item.date || ''}</span>
                <span class="time-value">${timeStr}s</span>
            `;
            
            timeList.appendChild(timeDiv);
        });
    });
}

// Instructions modal
function showInstructions() {
    const modal = document.getElementById('instructionModal');
    modal.classList.add('open');
}

function closeInstructionModal() {
    const modal = document.getElementById('instructionModal');
    modal.classList.remove('open');
}

// Patterns function
function showPatterns() {
    alert('Функция "Узоры" будет реализована в ближайшее время');
    // TODO: Реализовать показ узоров кубика Рубика
}

// Timer functions
function showTimer() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const chatContainer = document.getElementById('chatContainer');
    const timerSection = document.getElementById('timerSection');
    
    // Smooth transition
    if (welcomeScreen.style.display !== 'none') {
        welcomeScreen.style.opacity = '0';
    }
    if (chatContainer.style.display !== 'none') {
        chatContainer.style.opacity = '0';
    }
    
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        chatContainer.style.display = 'none';
        timerSection.style.display = 'flex';
        timerSection.style.opacity = '0';
        setTimeout(() => {
            timerSection.style.transition = 'opacity 0.3s ease';
            timerSection.style.opacity = '1';
        }, 50);
    }, 300);
    
    // Generate initial scramble
    if (!document.getElementById('scrambleDisplay').textContent) {
        generateTimerScramble();
    }
}

function generateTimerScramble() {
    const moves = ['R', 'L', 'F', 'B', 'U', 'D'];
    const modifiers = ['', '\'', '2'];
    const scrambleLength = Math.floor(Math.random() * 6) + 15; // Random between 15-20
    
    let scramble = '';
    let lastMove = '';
    
    for (let i = 0; i < scrambleLength; i++) {
        let move = '';
        do {
            move = moves[Math.floor(Math.random() * moves.length)];
        } while (move === lastMove || move[0] === lastMove[0]);
        
        lastMove = move;
        const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
        scramble += move + modifier + ' ';
    }
    
    document.getElementById('scrambleDisplay').textContent = scramble.trim();
}

function resetTimer() {
    timerRunning = false;
    currentTime = 0;
    isSaving = false; // Reset saving flag when resetting timer
    const saveBtn = document.querySelector('.save-timer-btn');
    if (saveBtn) {
        saveBtn.classList.remove('saving');
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    updateTimerDisplay();
    document.getElementById('timerDisplay').classList.remove('running');
    generateTimerScramble();
}

function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        isSaving = false; // Reset saving flag when starting new timer
        timerStartTime = Date.now() - currentTime * 10; // Adjust for current time in centiseconds
        timerInterval = setInterval(updateTimer, 10); // Update every 10ms (centiseconds)
        document.getElementById('timerDisplay').classList.add('running');
    }
}

function stopTimer() {
    if (timerRunning) {
        timerRunning = false;
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        document.getElementById('timerDisplay').classList.remove('running');
    }
}

function toggleTimer() {
    if (timerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function updateTimer() {
    currentTime = Math.floor((Date.now() - timerStartTime) / 10); // Convert to centiseconds
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const seconds = Math.floor(currentTime / 100);
    const centiseconds = currentTime % 100;
    
    const display = document.getElementById('timerDisplay');
    display.textContent = `${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

// Handle spacebar for timer
let spacebarPressed = false;

document.addEventListener('keydown', function(e) {
    // Only handle spacebar if timer section is visible
    const timerSection = document.getElementById('timerSection');
    if (timerSection && timerSection.style.display !== 'none') {
        // Prevent default spacebar behavior (scrolling)
        if (e.code === 'Space' || e.key === ' ') {
            // Don't prevent default if user is typing in an input field
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                spacebarPressed = true;
            }
        }
    }
});

document.addEventListener('keyup', function(e) {
    // Only handle spacebar if timer section is visible
    const timerSection = document.getElementById('timerSection');
    if (timerSection && timerSection.style.display !== 'none') {
        if ((e.code === 'Space' || e.key === ' ') && spacebarPressed) {
            // Don't trigger if user is typing in an input field
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                toggleTimer();
            }
            spacebarPressed = false;
        }
    }
});

// Initialize time list on load
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('userInput');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    // Migrate old data format to new format
    savedTimes = savedTimes.map(item => {
        if (!item.dateString) {
            // Try to parse existing date or use current date
            let dateObj;
            if (item.date) {
                dateObj = new Date(item.date);
            } else if (item.timestamp) {
                dateObj = new Date(item.timestamp);
            } else {
                dateObj = new Date();
            }
            item.dateString = getDateString(dateObj);
            if (!item.timestamp) {
                item.timestamp = dateObj.getTime();
            }
            if (!item.fullDate) {
                item.fullDate = item.date || dateObj.toLocaleString('ru-RU');
            }
        }
        return item;
    });
    localStorage.setItem('savedTimes', JSON.stringify(savedTimes));
    
    updateTimeList();
    hydrateProfile(); // Call again to ensure buttons are hidden after DOM is ready
    
    // Initialize timer display
    updateTimerDisplay();
});

// Friends
function addFriend() {
    const friendInput = document.getElementById('friendInput');
    const nickname = (friendInput.value || '').trim();
    if (!nickname) return;
    if (friends.includes(nickname)) { friendInput.value = ''; return; }
    friends.push(nickname);
    localStorage.setItem('friends', JSON.stringify(friends));
    updateFriendsList();
    friendInput.value = '';
}

function updateFriendsList() {
    const list = document.getElementById('friendsList');
    if (!list) return;
    if (friends.length === 0) {
        list.innerHTML = '<p style="color: rgba(255,255,255,0.5); font-size: 0.9rem;">Добавьте друзей по никнейму</p>';
        return;
    }
    list.innerHTML = '';
    friends.forEach(n => {
        const div = document.createElement('div');
        div.className = 'time-item';
        div.innerHTML = `<span>👤 ${n}</span>`;
        list.appendChild(div);
    });
}

// Profile
function hydrateProfile() {
    const profileSpan = document.getElementById('profileName');
    const modalProfileName = document.getElementById('modalProfileName');
    const modalProfileEmail = document.getElementById('modalProfileEmail');
    const modalProfileMethod = document.getElementById('modalProfileMethod');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    const user = JSON.parse(sessionStorage.getItem('cubick_user') || localStorage.getItem('cubick_user') || 'null');
    if (user && user.nickname) {
        if (profileSpan) profileSpan.textContent = user.nickname;
        if (modalProfileName) modalProfileName.textContent = user.nickname;
        if (modalProfileEmail) modalProfileEmail.textContent = user.email || '-';
        
        // Hide login and register buttons if user is logged in
        if (loginBtn) {
            loginBtn.style.display = 'none';
            loginBtn.style.visibility = 'hidden';
        }
        if (registerBtn) {
            registerBtn.style.display = 'none';
            registerBtn.style.visibility = 'hidden';
        }
    } else {
        // Show login and register buttons if user is not logged in
        if (loginBtn) {
            loginBtn.style.display = 'inline-block';
            loginBtn.style.visibility = 'visible';
        }
        if (registerBtn) {
            registerBtn.style.display = 'inline-block';
            registerBtn.style.visibility = 'visible';
        }
    }
    
    // Set method
    if (modalProfileMethod) {
        modalProfileMethod.textContent = currentMethod ? methods[currentMethod].name : 'Метод для новичков';
    }
}

// Call hydrateProfile immediately when script loads (if DOM is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateProfile);
} else {
    // DOM already loaded
    hydrateProfile();
}

// Modal functions
function showProfileModal() {
    const modal = document.getElementById('profileModal');
    hydrateProfile();
    modal.classList.add('open');
    document.getElementById('compactMenu').style.display = 'none';
    document.body.classList.add('no-scroll');
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

function showTimeScoringModal() {
    const modal = document.getElementById('timeScoringModal');
    updateTodayTimes();
    // Reset calendar to current month
    calendarCurrentMonth = new Date().getMonth();
    calendarCurrentYear = new Date().getFullYear();
    selectedCalendarDate = null;
    renderCalendar();
    modal.classList.add('open');
    document.getElementById('compactMenu').style.display = 'none';
    document.body.classList.add('no-scroll');
}

function closeTimeScoringModal() {
    const modal = document.getElementById('timeScoringModal');
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

function showInstructionsModal() {
    const modal = document.getElementById('instructionsModalCompact');
    const symbolRef = document.getElementById('symbolReferenceCompact');
    
    // Populate symbols
    const symbols = [
        { symbol: 'R', desc: 'Поворот правой грани по часовой стрелке (90°)' },
        { symbol: 'L', desc: 'Поворот левой грани по часовой стрелке (90°)' },
        { symbol: 'F', desc: 'Поворот передней грани по часовой стрелке (90°)' },
        { symbol: 'B', desc: 'Поворот задней грани по часовой стрелке (90°)' },
        { symbol: 'U', desc: 'Поворот верхней грани по часовой стрелке (90°)' },
        { symbol: 'D', desc: 'Поворот нижней грани по часовой стрелке (90°)' },
        { symbol: "R'", desc: 'Поворот правой грани против часовой стрелки (90°)' },
        { symbol: 'R2', desc: 'Поворот правой грани на 180° (двойной поворот)' },
        { symbol: 'x', desc: 'Поворот всего кубика вокруг оси X (как R)' },
        { symbol: 'y', desc: 'Поворот всего кубика вокруг оси Y (как U)' },
        { symbol: 'z', desc: 'Поворот всего кубика вокруг оси Z (как F)' },
        { symbol: 'f', desc: 'Поворот переднего и среднего слоя вместе' }
    ];
    
    symbolRef.innerHTML = symbols.map(s => 
        `<div class="symbol-item-compact"><strong>${s.symbol}</strong> - ${s.desc}</div>`
    ).join('');
    
    modal.classList.add('open');
    document.getElementById('compactMenu').style.display = 'none';
    document.body.classList.add('no-scroll');
}

function closeInstructionsModalCompact() {
    const modal = document.getElementById('instructionsModalCompact');
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

function showLogoutConfirm() {
    const modal = document.getElementById('logoutModal');
    modal.classList.add('open');
    document.getElementById('compactMenu').style.display = 'none';
    document.body.classList.add('no-scroll');
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

function confirmLogout() {
    sessionStorage.removeItem('cubick_user');
    localStorage.removeItem('cubick_user');
    closeLogoutModal();
    hydrateProfile();
    alert('Вы вышли из профиля');
}

function updateTodayTimes() {
    const today = getDateString(new Date());
    const todayTimes = savedTimes.filter(item => {
        const itemDate = item.dateString || getDateString(new Date(item.timestamp || Date.now()));
        return itemDate === today;
    });
    
    const todayList = document.getElementById('todayTimesList');
    if (todayTimes.length === 0) {
        todayList.innerHTML = '<p style="color: rgba(0,0,0,0.6);">Сегодня еще нет сохраненных результатов</p>';
    } else {
        todayList.innerHTML = '';
        todayTimes.sort((a, b) => a.time - b.time).forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'time-item-compact';
            const rank = index + 1;
            const trophy = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            div.innerHTML = `
                <span>${trophy} ${item.fullDate || ''}</span>
                <span class="time-value">${item.time.toFixed(2)}s</span>
            `;
            todayList.appendChild(div);
        });
    }
}

function clearTodayTimes() {
    if (!confirm('Вы уверены, что хотите удалить все результаты за сегодня?')) {
        return;
    }
    
    const today = getDateString(new Date());
    const initialLength = savedTimes.length;
    
    // Filter out today's times
    savedTimes = savedTimes.filter(item => {
        const itemDate = item.dateString || getDateString(new Date(item.timestamp || Date.now()));
        return itemDate !== today;
    });
    
    const removedCount = initialLength - savedTimes.length;
    
    if (removedCount > 0) {
        localStorage.setItem('savedTimes', JSON.stringify(savedTimes));
        updateTodayTimes();
        updateTimeList();
        renderCalendar(); // Update calendar to remove green markers
        alert(`Удалено результатов за сегодня: ${removedCount}`);
    } else {
        alert('Сегодня нет сохраненных результатов для удаления');
    }
}

// Calendar functions
function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearHeader = document.getElementById('calendarMonthYear');
    
    if (!calendarGrid) return;
    
    // Set month/year header
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    monthYearHeader.textContent = `${monthNames[calendarCurrentMonth]} ${calendarCurrentYear}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(calendarCurrentYear, calendarCurrentMonth, 1).getDay();
    const daysInMonth = new Date(calendarCurrentYear, calendarCurrentMonth + 1, 0).getDate();
    const today = new Date();
    const isTodayMonth = today.getMonth() === calendarCurrentMonth && today.getFullYear() === calendarCurrentYear;
    
    // Get dates with saved times
    const datesWithTimes = new Set();
    savedTimes.forEach(item => {
        if (item.dateString) {
            const [day, month, year] = item.dateString.split('.');
            datesWithTimes.add(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        }
    });
    
    calendarGrid.innerHTML = '';
    
    // Day headers
    const dayHeaders = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });
    
    // Adjust first day for Monday start (0=Sunday, 1=Monday)
    let startDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // Previous month days
    const prevMonthDays = new Date(calendarCurrentYear, calendarCurrentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = prevMonthDays - i;
        calendarGrid.appendChild(day);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Check if this date has saved times
        const dateKey = `${calendarCurrentYear}-${String(calendarCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (datesWithTimes.has(dateKey)) {
            dayElement.classList.add('has-times');
        }
        
        // Mark today
        if (isTodayMonth && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Mark selected
        if (selectedCalendarDate && selectedCalendarDate.toDateString() === new Date(calendarCurrentYear, calendarCurrentMonth, day).toDateString()) {
            dayElement.classList.add('selected');
        }
        
        dayElement.onclick = () => selectDate(new Date(calendarCurrentYear, calendarCurrentMonth, day));
        calendarGrid.appendChild(dayElement);
    }
    
    // Next month days
    const totalCells = startDay + daysInMonth;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells && totalCells + day <= 42; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    }
}

function changeMonth(delta) {
    calendarCurrentMonth += delta;
    if (calendarCurrentMonth < 0) {
        calendarCurrentMonth = 11;
        calendarCurrentYear--;
    } else if (calendarCurrentMonth > 11) {
        calendarCurrentMonth = 0;
        calendarCurrentYear++;
    }
    renderCalendar();
}

function selectDate(date) {
    selectedCalendarDate = date;
    const dateString = getDateString(date);
    showTimesForSelectedDate(dateString);
    renderCalendar(); // Re-render to show selected state
}

function showTimesForSelectedDate(dateString) {
    const selectedDateTimesDiv = document.getElementById('selectedDateTimes');
    
    const timesForDate = savedTimes.filter(item => {
        const itemDate = item.dateString || getDateString(new Date(item.timestamp || Date.now()));
        return itemDate === dateString;
    });
    
    if (timesForDate.length === 0) {
        selectedDateTimesDiv.innerHTML = `<h3 style="color: #000000; margin-top: 20px;">Результаты за ${dateString}</h3><p style="color: rgba(0,0,0,0.6);">На эту дату нет сохраненных результатов</p>`;
    } else {
        selectedDateTimesDiv.innerHTML = `<h3 style="color: #000000; margin-top: 20px;">Результаты за ${dateString}</h3>`;
        timesForDate.sort((a, b) => a.time - b.time).forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'time-item-compact';
            const rank = index + 1;
            const trophy = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            div.innerHTML = `
                <span>${trophy} ${item.fullDate || ''}</span>
                <span class="time-value">${item.time.toFixed(2)}s</span>
            `;
            selectedDateTimesDiv.appendChild(div);
        });
    }
}


