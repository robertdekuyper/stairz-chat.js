/* ===============================
   Stairz Chat Widget – Auto Build
   Versie: 2025-10-06
   =============================== */
const WEBHOOK_URL = "https://n8n.srv880919.hstgr.cloud/webhook/a476be50-de85-41ed-8195-3da36aeb0a51/chat";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🟣 Stairz Chat geladen...");
  
  /* === Voeg chat HTML dynamisch toe === */
  const chatWrapper = document.createElement("div");
  chatWrapper.id = "stairz-widget";
  chatWrapper.innerHTML = `
    <div id="chat-container" class="chat-container"></div>
    <form id="chat-form" class="chat-form">
      <input id="chat-input" type="text" placeholder="Typ je bericht..." autocomplete="off"/>
      <button type="submit">Verstuur</button>
    </form>
  `;
  document.body.appendChild(chatWrapper);
  
  const chatContainer = document.getElementById("chat-container");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  
  console.log("✅ Chat elementen toegevoegd:", {
    chatContainer: !!chatContainer,
    chatForm: !!chatForm,
    chatInput: !!chatInput
  });
  
  /* === Markdown Parser laden === */
  const showdownScript = document.createElement("script");
  showdownScript.src = "https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js";
  document.head.appendChild(showdownScript);
  
  let converter = null;
  showdownScript.onload = () => {
    converter = new showdown.Converter();
    console.log("✅ Markdown parser geladen");
  };
  
  showdownScript.onerror = () => {
    console.error("❌ Kon Showdown niet laden");
  };
  
  /* === Helper: veilige markdown-conversie === */
  function toHTML(markdown) {
    if (converter) return converter.makeHtml(markdown);
    console.warn("⚠️ Markdown parser nog niet klaar, gebruik plain text");
    return markdown.replace(/\n/g, '<br>');
  }
  
  /* === Bericht toevoegen aan chat === */
  function addMessage(message, sender = "bot") {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.innerHTML = toHTML(message);
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    console.log(`💬 Bericht toegevoegd (${sender}):`, message);
  }
  
  /* === Bericht naar N8N sturen === */
  async function sendMessage(message) {
    console.log("📤 Bericht verstuurd:", message);
    addMessage(message, "user");
    chatInput.value = "";
    chatInput.disabled = true; // Voorkom dubbele verzending
    
    // Toon typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot", "typing");
    typingDiv.textContent = "...";
    typingDiv.id = "typing-indicator";
    chatContainer.appendChild(typingDiv);
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: message })
      });
      
      // Verwijder typing indicator
      const typing = document.getElementById("typing-indicator");
      if (typing) typing.remove();
      
      if (!response.ok) {
        console.error("❌ Server error:", response.status);
        addMessage("⚠️ Er ging iets mis bij het verbinden met de server.");
        return;
      }
      
      const text = await response.text();
      console.log("📩 Ruwe respons:", text);
      
      let data;
      try {
        data = JSON.parse(text);
        console.log("📦 Geparsede data:", data);
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError);
        addMessage("⚠️ Ongeldig antwoord ontvangen van de server.");
        return;
      }
      
      if (data.image) {
        addMessage(`${data.text}\n\n![](${data.image})`, "bot");
      } else if (data.text) {
        addMessage(data.text, "bot");
      } else if (data.output) {
        addMessage(data.output, "bot");
      } else {
        console.warn("⚠️ Onverwacht data format:", data);
        addMessage("Ik kon even geen passend antwoord vinden 🤔", "bot");
      }
    } catch (err) {
      console.error("🚨 Fout bij verzenden:", err);
      const typing = document.getElementById("typing-indicator");
      if (typing) typing.remove();
      addMessage("⚠️ Kon geen verbinding maken met de server.", "bot");
    } finally {
      chatInput.disabled = false;
      chatInput.focus();
    }
  }
  
  /* === Event listener === */
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("📝 Form submit event triggered");
    const message = chatInput.value.trim();
    console.log("📝 Input waarde:", message);
    if (message) {
      sendMessage(message);
    } else {
      console.warn("⚠️ Leeg bericht, niet verzonden");
    }
  });
  
  console.log("✅ Event listener toegevoegd aan form");
  
  // Test bericht voor debugging
  addMessage("👋 Hallo! Hoe kan ik je helpen?", "bot");
});
