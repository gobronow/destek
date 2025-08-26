import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Menü elementleri
const navLoginLink = document.getElementById('nav-login-link');
const navUserInfo = document.getElementById('nav-user-info');
const navUsername = document.getElementById('nav-username');
const navLogoutLink = document.getElementById('nav-logout-link');
const navProfilePic = document.getElementById('nav-profile-pic');

// Login sayfası elementleri
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const errorMessageDiv = document.getElementById('error-message');

// Profil sayfası elementleri
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileSignupDate = document.getElementById('profile-signup-date');
const profilePic = document.getElementById('profile-pic');
const fileInput = document.getElementById('file-input');

// Profil Düzenleme elementleri
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileFormContainer = document.getElementById('edit-profile-form-container');
const editProfileForm = document.getElementById('edit-profile-form');
const editNameInput = document.getElementById('edit-name');

// Şifre Değiştirme elementleri
const changePasswordBtn = document.getElementById('change-password-btn');
const changePasswordFormContainer = document.getElementById('change-password-form-container');
const changePasswordForm = document.getElementById('change-password-form');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');


// Dinamik menü ve sayfa geçişleri
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Kullanıcı giriş yaptıysa
        if (navLoginLink) navLoginLink.style.display = 'none';
        if (navUserInfo) navUserInfo.style.display = 'inline-flex';

        // Kullanıcı bilgilerini veritabanından al
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        let userProfileData = {};

        if (docSnap.exists()) {
            userProfileData = docSnap.data();
        }

        const displayName = user.displayName || user.email.split('@')[0];
        const photoURL = userProfileData.photoURL || 'default_profile_pic.png';

        if (navUsername) navUsername.textContent = `Hoş Geldiniz, ${displayName}!`;
        if (navProfilePic) {
            navProfilePic.src = photoURL;
            navProfilePic.style.display = 'block';
        }
        if (profilePic) profilePic.src = photoURL;
        if (profileName) profileName.textContent = displayName;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileSignupDate) {
            const date = new Date(user.metadata.creationTime);
            profileSignupDate.textContent = date.toLocaleDateString('tr-TR');
        }

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
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ad = registerForm['reg-ad'].value;
        const soyad = registerForm['reg-soyad'].value;
        const email = registerForm['reg-email'].value;
        const password = registerForm['reg-password'].value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: `${ad} ${soyad}` });
            
            // Kullanıcı verilerini Firestore'a kaydet
            await setDoc(doc(db, "users", userCredential.user.uid), {
                displayName: `${ad} ${soyad}`,
                email: email,
                createdAt: userCredential.user.metadata.creationTime
            });

            registerForm.reset();
            errorMessageDiv.textContent = 'Kayıt başarılı! Yönlendiriliyorsunuz...';
        } catch (error) {
            errorMessageDiv.textContent = error.message;
        }
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

// Profil resmi yükleme mantığı
if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const user = auth.currentUser;
        if (!user) {
            console.error('Kullanıcı giriş yapmamış.');
            return;
        }

        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        
        try {
            // Resmi Firebase Storage'a yükle
            await uploadBytes(storageRef, file);
            
            // Yüklenen resmin URL'sini al
            const photoURL = await getDownloadURL(storageRef);

            // Kullanıcı veritabanı belgesini bul ve resim URL'sini ekle
            await setDoc(doc(db, "users", user.uid), { photoURL: photoURL }, { merge: true });
            
            alert('Profil resmi başarıyla güncellendi!');
            location.reload(); // Sayfayı yenilemek için
        } catch (error) {
            alert('Profil resmi yüklenirken bir hata oluştu: ' + error.message);
        }
    });
}

// Profili düzenleme formunu göster/gizle
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        editProfileFormContainer.style.display = 'block';
        changePasswordFormContainer.style.display = 'none';
    });
}

// Profili düzenleme formunu gönderme
if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = editNameInput.value;
        const user = auth.currentUser;

        if (user && newName) {
            try {
                await updateProfile(user, { displayName: newName });
                
                // Firestore'daki displayName'i de güncelle
                await setDoc(doc(db, "users", user.uid), { displayName: newName }, { merge: true });
                
                alert('Profil başarıyla güncellendi!');
                location.reload();
            } catch (error) {
                alert('Profil güncellenirken bir hata oluştu: ' + error.message);
            }
        }
    });
}

// Şifre değiştirme formunu göster/gizle
if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
        changePasswordFormContainer.style.display = 'block';
        editProfileFormContainer.style.display = 'none';
    });
}

// Şifre değiştirme formunu gönderme
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const user = auth.currentUser;

        if (user && currentPassword && newPassword) {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            
            try {
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPassword);
                alert('Şifreniz başarıyla değiştirildi!');
                changePasswordForm.reset();
                changePasswordFormContainer.style.display = 'none';
            } catch (error) {
                alert('Şifre değiştirilirken bir hata oluştu: ' + error.message);
            }
        }
    });
}
