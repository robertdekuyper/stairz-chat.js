/* ===============================
   Stairz Chat Widget – Complete versie
   Versie: 2025-10-06
   =============================== */
const WEBHOOK_URL = "https://n8n.srv880919.hstgr.cloud/webhook/a476be50-de85-41ed-8195-3da36aeb0a51/chat";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🟣 Stairz Chat geladen...");
  
  /* === Voeg CSS toe === */
  const style = document.createElement("style");
  style.textContent = `
    #stairz-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 500px;
      max-height: calc(100vh - 100px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      z-index: 9999;
      overflow: hidden;
    }
    
    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f8f9fa;
    }
    
    .message {
      margin-bottom: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      max-width: 80%;
      word-wrap: break-word;
      animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .message.user {
      background: #007bff;
      color: white;
      margin-left: auto;
      text-align: right;
    }
    
    .message.bot {
      background: white;
      color: #333;
      border: 1px solid #e0e0e0;
    }
    
    .message.typing {
      background: white;
      color: #999;
      font-style: italic;
      border: 1px solid #e0e0e0;
    }
    
    .message img {
      max-width: 100%;
      border-radius: 8px;
      margin-top: 8px;
    }
    
    .chat-form {
      display: flex;
      padding: 15px;
      background: white;
      border-top: 1px solid #e0e0e0;
      gap: 10px;
    }
    
    #chat-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    
    #chat-input:focus {
      border-color: #007bff;
    }
    
    #chat-input:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }
    
    .chat-form button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }
    
    .chat-form button:hover {
      background: #0056b3;
    }
    
    .chat-form button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    /* Scrollbar styling */
    .chat-container::-webkit-scrollbar {
      width: 6px;
    }
    
    .chat-container::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .chat-container::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;
    }
    
    .chat-container::-webkit-scrollbar-thumb:hover {
      background: #999;
    }
  `;
  document.head.appendChild(style);
  
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
  
  console.log("✅ Chat elementen toegevoegd");
  
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
    return markdown.replace(/\n/g, '<br>');
  }
  
  /* === Bericht toevoegen aan chat === */
  function addMessage(message, sender = "bot") {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.innerHTML = toHTML(message);
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  /* === Bericht naar N8N sturen === */
  async function sendMessage(message) {
    console.log("📤 Bericht verstuurd:", message);
    addMessage(message, "user");
    chatInput.value = "";
    chatInput.disabled = true;
    
    const submitBtn = chatForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    
    // Toon typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot", "typing");
    typingDiv.textContent = "Aan het typen...";
    typingDiv.id = "typing-indicator";
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: message })
      });
      
      const typing = document.getElementById("typing-indicator");
      if (typing) typing.remove();
      
      if (!response.ok) {
        console.error("❌ Server error:", response.status);
        addMessage("⚠️ Er ging iets mis bij het verbinden met de server.");
        return;
      }
      
      const text = await response.text();
      console.log("📩 Respons ontvangen");
      
      let data;
      try {
        data = JSON.parse(text);
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
        addMessage("Ik kon even geen passend antwoord vinden 🤔", "bot");
      }
    } catch (err) {
      console.error("🚨 Fout bij verzenden:", err);
      const typing = document.getElementById("typing-indicator");
      if (typing) typing.remove();
      addMessage("⚠️ Kon geen verbinding maken met de server.", "bot");
    } finally {
      chatInput.disabled = false;
      submitBtn.disabled = false;
      chatInput.focus();
    }
  }
  
  /* === Event listener === */
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message) {
      sendMessage(message);
    }
  });
  
  // Welkomstbericht
  addMessage("👋 Hallo! Hoe kan ik je helpen?", "bot");
  chatInput.focus();
});
