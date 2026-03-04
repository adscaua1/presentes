import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  collection 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "modo-teste-330b3.firebaseapp.com",
  projectId: "modo-teste-330b3",
  storageBucket: "modo-teste-330b3.firebasestorage.app",
  messagingSenderId: "265095317149",
  appId: "1:265095317149:web:d7ec3726689487e100f674"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const selecionadosDiv = document.getElementById("selecionados");
const contador = document.getElementById("contador");

let meusItens = JSON.parse(localStorage.getItem("meusPresentes")) || [];

function salvarLocal(){
  localStorage.setItem("meusPresentes", JSON.stringify(meusItens));
}

function atualizarCaixinha(){
  selecionadosDiv.innerHTML = "";

  meusItens.forEach(itemId => {

    const div = document.createElement("div");
    div.classList.add("item-selecionado");
    div.innerHTML = `
      <span>${itemId}</span>
      <button class="cancelar">Cancelar</button>
    `;

    div.querySelector(".cancelar").addEventListener("click", async () => {

      await deleteDoc(doc(db, "presentes", itemId));

      meusItens = meusItens.filter(i => i !== itemId);
      salvarLocal();
      atualizarCaixinha();
    });

    selecionadosDiv.appendChild(div);
  });
}

atualizarCaixinha();


// ================== CONTADOR EM TEMPO REAL ==================

const totalItens = document.querySelectorAll(".card").length;

onSnapshot(collection(db, "presentes"), (snapshot) => {
  if(contador){
    contador.textContent = `💍 ${snapshot.size} de ${totalItens} presentes já foram reservados`;
  }
});


// ================== CARDS ==================

document.querySelectorAll(".card").forEach(card => {

  const itemId = card.dataset.item;
  const link = card.querySelector("a");
  const itemRef = doc(db, "presentes", itemId);

  // Atualização em tempo real
  onSnapshot(itemRef, (docSnap) => {

    if(docSnap.exists()){
      card.classList.add("presenteado");
      link.textContent = "Reservado 💍";
    } else {
      card.classList.remove("presenteado");
      link.textContent = "Presentear";
    }

  });

  link.addEventListener("click", async () => {

    if(link.textContent === "Reservado 💍"){
      return;
    }

    await setDoc(itemRef, { reservado: true });

    if(!meusItens.includes(itemId)){
      meusItens.push(itemId);
      salvarLocal();
      atualizarCaixinha();
    }

  });

});