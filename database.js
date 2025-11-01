// User database functions (shared between pages)
function getUserDatabase() {
    return JSON.parse(localStorage.getItem('userDatabase')) || [];
}

function saveUserDatabase(users) {
    localStorage.setItem('userDatabase', JSON.stringify(users));
}

function findUserByEmail(email) {
    const users = getUserDatabase();
    return users.find(user => user.email === email.toLowerCase().trim());
}

function createUser(email, password, nickname) {
    const users = getUserDatabase();
    
    // Check if user already exists
    if (findUserByEmail(email)) {
        return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    
    // Simple hash function (in production, use proper hashing like bcrypt)
    const passwordHash = btoa(password).split('').reverse().join('');
    const newUser = {
        id: Date.now().toString(),
        email: email.toLowerCase().trim(),
        passwordHash: passwordHash,
        nickname: nickname.trim(),
        createdAt: new Date().toISOString(),
        savedTimes: [],
        friends: []
    };
    users.push(newUser);
    saveUserDatabase(users);
    return { success: true, user: newUser };
}

function verifyPassword(user, password) {
    const passwordHash = btoa(password).split('').reverse().join('');
    return user.passwordHash === passwordHash;
}

function loginUser(email, password) {
    const user = findUserByEmail(email);
    if (!user) {
        return { success: false, error: 'Пользователь не найден' };
    }
    if (!verifyPassword(user, password)) {
        return { success: false, error: 'Неверный пароль' };
    }
    return { success: true, user: user };
}

