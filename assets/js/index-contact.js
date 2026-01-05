import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCosgHwGCK4mqS7qz9ZCX0ctR17I1PLPIQ",
  authDomain: "vitriottv.firebaseapp.com",
  projectId: "vitriottv",
  storageBucket: "vitriottv.firebasestorage.app",
  messagingSenderId: "159136613568",
  appId: "1:159136613568:web:62971549847db867551925",
  measurementId: "G-20CWGK8ZL6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const messaggio = form.messaggio.value.trim();

    try {
      await addDoc(collection(db, "messaggi"), {
        nome, email, messaggio,
        createdAt: serverTimestamp()
      });
      alert("Messaggio inviato! Grazie ❤️");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Si è verificato un errore. Riprova più tardi.");
    }
  });
}
