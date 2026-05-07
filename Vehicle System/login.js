// Demo credentials
const VALID_CREDENTIALS = {
    admin: {
        email: 'sirjune@gmail.com',
        password: 'sirjune123',
        role: 'admin',
        displayName: 'Admin Marcel'
    },
    guest: {
        email: 'guest@cdrrmo.ph',
        password: 'guest123',
        role: 'guest',
        displayName: 'Guest User'
    }
};

function redirectIfLoggedIn() {
    const loggedInUser = localStorage.getItem('cdrmmo_user');
    if (loggedInUser) {
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    redirectIfLoggedIn();
});

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim().toLowerCase();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    const loginBtn = document.getElementById('loginBtn');

    if (!errorMsg || !loginBtn) {
        return;
    }

    errorMsg.textContent = '';
    errorMsg.classList.remove('show');

    const user = VALID_CREDENTIALS[username];
    if (!user || user.password !== password || user.email !== email) {
        showError('Invalid username, email, or password');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    setTimeout(() => {
        localStorage.setItem('cdrmmo_user', username);
        localStorage.setItem('cdrmmo_role', user.role);
        localStorage.setItem('cdrmmo_displayName', user.displayName);
        localStorage.setItem('cdrmmo_loginTime', new Date().toLocaleString());
        window.location.href = 'index.html';
    }, 500);
}

function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    if (!errorMsg) {
        console.warn('Error element not found:', message);
        return;
    }
    errorMsg.textContent = message;
    errorMsg.classList.add('show');

    setTimeout(() => {
        errorMsg.classList.remove('show');
    }, 4000);
}
