<script>
/* === CONFIG === */
const WEBHOOK_URL = "https://n8n.srv880919.hstgr.cloud/webhook/a476be50-de85-41ed-8195-3da36aeb0a51/chat";


/* === ELEMENTEN OPHALEN === */
const chatContainer = document.getElementById("chat-container");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

/* === HELPER FUNCTIE OM BERICHTEN TOE TE VOEGEN === */
function addMessage(message, sender = "bot") {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = message; // Gebruik innerHTML zodat <img> wordt weergegeven
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* === STUUR EEN BERICHT NAAR DE WEBHOOK === */
async function sendMessage(message) {
  console.log("Bericht verstuurd:", message);

  // Toon het gebruikersbericht in de chat
  addMessage(message, "user");
  chatInput.value = "";

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatInput: message })
    });

    console.log("Status:", response.status);

    if (!response.ok) {
      addMessage("⚠️ Er ging iets mis bij het verbinden met de server.");
      return;
    }

    const text = await response.text();
    console.log("Ruwe respons van N8N:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Kon geen JSON maken van respons:", e);
      addMessage("⚠️ Ongeldig antwoord ontvangen van de server.");
      return;
    }

    console.log("Geparste data:", data);

    // === BERICHT WEERGEVEN ===
    if (data.image) {
      addMessage(`${data.text}<br><img src="${data.image}" alt="decor voorbeeld" style="max-width:100%;border-radius:10px;margin-top:8px;">`, "bot");
    } else if (data.text) {
      addMessage(data.text, "bot");
    } else if (data.output) {
      addMessage(data.output, "bot");
    } else {
      addMessage("Ik kon even geen passend antwoord vinden 🤔", "bot");
    }
  } catch (error) {
    console.error("Fout bij verzenden:", error);
    addMessage("⚠️ Kon geen verbinding maken met de server.", "bot");
  }
}

/* === EVENT-LISTENERS === */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (message) sendMessage(message);
});
</script>
