import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCA472SQszpShn8KaQciXgOJnJEUd6lMvE",
    authDomain: "destek-ffdf2.firebaseapp.com",
    projectId: "destek-ffdf2",
    storageBucket: "destek-ffdf2.firebasestorage.app",
    messagingSenderId: "1082158355438",
    appId: "1:1082158355438:web:c7ce6a8baf9c5dad9bb4ff"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Menü elementleri
const navLoginLink = document.getElementById('nav-login-link');
const navUserInfo = document.getElementById('nav-user-info');
const navUsername = document.getElementById('nav-username');
const navLogoutLink = document.getElementById('nav-logout-link');

// Login sayfası elementleri
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const errorMessageDiv = document.getElementById('error-message');

// Profil sayfası elementleri
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');


// Dinamik menü ve sayfa geçişleri
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Kullanıcı giriş yaptıysa
        if (navLoginLink) navLoginLink.style.display = 'none';
        if (navUserInfo) navUserInfo.style.display = 'inline';
        if (navUsername) {
            navUsername.textContent = `Hoş Geldiniz, ${user.displayName || user.email.split('@')[0]}!`;
        }
        
        // Profil sayfası bilgilerini doldur
        if (profileName) profileName.textContent = user.displayName;
        if (profileEmail) profileEmail.textContent = user.email;

    } else {
        // Kullanıcı çıkış yaptıysa
        if (navLoginLink) navLoginLink.style.display = 'block';
        if (navUserInfo) navUserInfo.style.display = 'none';
    }
});

// Otomatik yönlendirme
if (window.location.pathname.endsWith('login.html')) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = 'profile.html';
        }
    });
}
if (window.location.pathname.endsWith('profile.html')) {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
        }
    });
}


// Formlar arasında geçiş (login.html)
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
}
if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });
}

// Kayıt olma (login.html)
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ad = registerForm['reg-ad'].value;
        const soyad = registerForm['reg-soyad'].value;
        const sehir = registerForm['reg-sehir'].value;
        const email = registerForm['reg-email'].value;
        const password = registerForm['reg-password'].value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                return updateProfile(userCredential.user, { displayName: `${ad} ${soyad}` });
            })
            .then(() => {
                registerForm.reset();
                errorMessageDiv.textContent = 'Kayıt başarılı! Yönlendiriliyorsunuz...';
            })
            .catch((error) => {
                errorMessageDiv.textContent = error.message;
            });
    });
}

// Giriş yapma (login.html)
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm['email'].value;
        const password = loginForm['password'].value;

        signInWithEmailAndPassword(auth, email, password)
            .then((cred) => {
                loginForm.reset();
                errorMessageDiv.textContent = 'Giriş başarılı! Yönlendiriliyorsunuz...';
            })
            .catch((error) => {
                errorMessageDiv.textContent = error.message;
            });
    });
}

// Çıkış yapma (menüdeki link)
if (navLogoutLink) {
    navLogoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth)
            .then(() => {
                window.location.href = 'login.html';
            });
    });
}
