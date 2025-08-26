import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
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

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const userDashboard = document.getElementById('user-info');
const userEmailSpan = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const errorMessageDiv = document.getElementById('error-message');

// Sayfa yüklendiğinde URL'yi kontrol et ve doğru formu göster
const urlParams = new URLSearchParams(window.location.search);
const formType = urlParams.get('form');

if (formType === 'kayit-ol') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
} else {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}


// Formlar arasında geçiş
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
});

// Kayıt olma
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ad = registerForm['reg-ad'].value;
    const soyad = registerForm['reg-soyad'].value;
    const sehir = registerForm['reg-sehir'].value;
    const email = registerForm['reg-email'].value;
    const password = registerForm['reg-password'].value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            console.log('Kullanıcı oluşturuldu:', cred.user);
            // Ek bilgileri alıyoruz, ancak henüz kaydetmiyoruz.
            const userExtraInfo = {
                ad: ad,
                soyad: soyad,
                sehir: sehir
            };
            console.log('Ek kullanıcı bilgileri:', userExtraInfo);

            registerForm.reset();
            errorMessageDiv.textContent = 'Kayıt başarılı!';
        })
        .catch((error) => {
            errorMessageDiv.textContent = error.message;
        });
});

// Giriş yapma
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

// Çıkış yapma
logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('Çıkış yapıldı');
        });
});

// Kullanıcı durumunu kontrol et
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Kullanıcı giriş yaptıysa
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        userDashboard.style.display = 'block';
        userEmailSpan.textContent = user.email;
    } else {
        // Kullanıcı çıkış yaptıysa
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        userDashboard.style.display = 'none';
    }
});