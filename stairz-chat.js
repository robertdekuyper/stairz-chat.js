/* ===============================
   Stairz Chat Widget
   Versie: 2025-10-06
   =============================== */

const WEBHOOK_URL = "https://n8n.srv880919.hstgr.cloud/webhook/a476be50-de85-41ed-8195-3da36aeb0a51/chat";

/* === Wacht tot de pagina geladen is === */
document.addEventListener("DOMContentLoaded", () => {
  console.log("🟣 Stairz Chat geladen...");

  const chatContainer = document.getElementById("chat-container");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  if (!chatContainer || !chatForm || !chatInput) {
    console.error("❌ Chat-elementen niet gevonden in HTML!");
    return;
  }

  /* === Markdown Parser toevoegen (voor vetgedrukte tekst en afbeeldingen) === */
  const showdownScript = document.createElement("script");
  showdownScript.src = "https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js";
  document.head.appendChild(showdownScript);

  let converter = null;

// Wacht tot showdown geladen is voordat we hem gebruiken
showdownScript.onload = () => {
  converter = new showdown.Converter();
  console.log("✅ Markdown parser geladen en klaar voor gebruik");
};

// Helperfunctie om veilig markdown te converteren
function toHTML(markdown) {
  if (converter) {
    return converter.makeHtml(markdown);
  } else {
    console.warn("⚠️ Markdown parser nog niet geladen, toon ruwe tekst");
    return markdown;
  }
}


  /* === Bericht toevoegen aan chat === */
  function addMessage(message, sender = "bot") {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);

    // Markdown naar HTML converteren
    const html = converter ? converter.makeHtml(message) : message;

    msg.innerHTML = html;
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  /* === Bericht naar N8N sturen === */
  async function sendMessage(message) {
    console.log("📤 Bericht verstuurd:", message);

    // Gebruikersbericht tonen
    addMessage(message, "user");
    chatInput.value = "";

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: message })
      });

      console.log("🔹 HTTP status:", response.status);

      if (!response.ok) {
        addMessage("⚠️ Er ging iets mis bij het verbinden met de server.");
        return;
      }

      const text = await response.text();
      console.log("📩 Ruwe respons:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        addMessage("⚠️ Ongeldig antwoord ontvangen van de server.");
        return;
      }

      // === Resultaat weergeven ===
      if (data.image) {
        addMessage(`${data.text}\n\n![](${data.image})`, "bot");
      } else if (data.text) {
        addMessage(data.text, "bot");
      } else if (data.output) {
        addMessage(data.output, "bot");
      } else {
        addMessage("Ik kon even geen passend antwoord vinden 🤔", "bot");
      }

    } catch (error) {
      console.error("🚨 Fout bij verzenden:", error);
      addMessage("⚠️ Kon geen verbinding maken met de server.", "bot");
    }
  }

  /* === Formulier-event koppelen === */
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message) sendMessage(message);
  });
});
