import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    updateProfile // Yeni eklenen fonksiyon
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// BURAYI KENDİ FIREBASE PROJENİN BİLGİLERİYLE DEĞİŞTİR
const firebaseConfig = {
    apiKey: "AIzaSyCA472SQszpShn8KaQciXgOJnJEUd6lMvE",
    authDomain: "destek-ffdf2.firebaseapp.com",
    projectId: "destek-ffdf2",
    storageBucket: "destek-ffdf2.firebasestorage.app",
    messagingSenderId: "1082158355438",
    appId: "1:1082158355438:web:c7ce6a8baf9c5dad9bb4ff"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login sayfası elementleri
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const userDashboard = document.getElementById('user-info');
const userEmailSpan = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const errorMessageDiv = document.getElementById('error-message');

// Menü elementleri
const navLoginLink = document.getElementById('nav-login-link');
const navUserInfo = document.getElementById('nav-user-info');
const navUsername = document.getElementById('nav-username');
const navLogoutLink = document.getElementById('nav-logout-link');

// Sayfa yüklendiğinde URL'yi kontrol et ve doğru formu göster
const urlParams = new URLSearchParams(window.location.search);
const formType = urlParams.get('form');

if (formType === 'kayit-ol') {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
} else {
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
}

// Formlar arasında geçiş
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

// Kayıt olma
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
                // Kullanıcı oluşturuldu, şimdi adını güncelleyelim
                return updateProfile(userCredential.user, { displayName: `${ad} ${soyad}` });
            })
            .then(() => {
                console.log('Kullanıcı oluşturuldu ve adı güncellendi.');
                registerForm.reset();
                errorMessageDiv.textContent = 'Kayıt başarılı! Giriş yapabilirsiniz.';
            })
            .catch((error) => {
                errorMessageDiv.textContent = error.message;
            });
    });
}

// Giriş yapma
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm['email'].value;
        const password = loginForm['password'].value;

        signInWithEmailAndPassword(auth, email, password)
            .then((cred) => {
                console.log('Giriş yapıldı:', cred.user);
                loginForm.reset();
                errorMessageDiv.textContent = '';
            })
            .catch((error) => {
                errorMessageDiv.textContent = error.message;
            });
    });
}

// Çıkış yapma
if (navLogoutLink) {
    navLogoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth)
            .then(() => {
                console.log('Çıkış yapıldı');
            });
    });
}

// Kullanıcı durumunu kontrol et ve menüyü güncelle
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Kullanıcı giriş yaptıysa
        if (navLoginLink) navLoginLink.style.display = 'none';
        if (navUserInfo) navUserInfo.style.display = 'inline';
        if (navUsername) navUsername.textContent = `Hoş Geldiniz, ${user.displayName || user.email.split('@')[0]}!`;
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (userDashboard) userDashboard.style.display = 'block';
        if (userEmailSpan) userEmailSpan.textContent = user.email;
    } else {
        // Kullanıcı çıkış yaptıysa
        if (navLoginLink) navLoginLink.style.display = 'block';
        if (navUserInfo) navUserInfo.style.display = 'none';
        if (loginForm) {
            loginForm.style.display = (formType === 'kayit-ol' ? 'none' : 'block');
        }
        if (registerForm) {
            registerForm.style.display = (formType === 'kayit-ol' ? 'block' : 'none');
        }
        if (userDashboard) userDashboard.style.display = 'none';
    }
});
