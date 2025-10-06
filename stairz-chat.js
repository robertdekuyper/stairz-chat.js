/* === CONFIG === */
const WEBHOOK_URL = "https://n8n.srv880919.hstgr.cloud/webhook/a476be50-de85-41ed-8195-3da36aeb0a51/chat";

/* === CHAT WIDGET BOUWEN === */
(function createChatWidget() {
  const widget = document.createElement("div");
  widget.id = "stairz-widget";
  widget.innerHTML = `
    <style>
      #chat-button {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background-color: #5a2ca0;
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        z-index: 9999;
      }
      #chat-button:hover {
        transform: scale(1.1);
        background-color: #7036cc;
      }
      #chat-box {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 320px;
        height: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 25px rgba(0,0,0,0.2);
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 9998;
        animation: fadeIn 0.3s ease;
      }
      #chat-header {
        background: #5a2ca0;
        color: white;
        padding: 12px;
        font-weight: 600;
        text-align: center;
      }
      #chat-messages {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        font-size: 14px;
        color: #333;
      }
      #chat-messages .message {
        margin: 8px 0;
        line-height: 1.4;
      }
      .message.bot {
        color: #333;
        background: #f1f0ff;
        padding: 6px 10px;
        border-radius: 8px;
        width: fit-content;
        max-width: 80%;
      }
      .message.user {
        background: #e2e2e2;
        align-self: flex-end;
        padding: 6px 10px;
        border-radius: 8px;
        width: fit-content;
        max-width: 80%;
      }
      #chat-input-area {
        display: flex;
        padding: 8px;
        border-top: 1px solid #ddd;
        background: #fafafa;
      }
      #chat-input-area input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 6px;
      }
      #chat-input-area button {
        margin-left: 8px;
        padding: 8px 12px;
        background: #5a2ca0;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
      #chat-input-area button:hover {
        background: #7036cc;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>

    <button id="chat-button">💬</button>

    <div id="chat-box">
      <div id="chat-header">Stairz Traprenovatie</div>
      <div id="chat-messages">
        <div class="message bot">Hoi 👋, welkom bij Stairz! Waarmee kan ik je helpen vandaag?</div>
      </div>
      <div id="chat-input-area">
        <input type="text" id="chat-input" placeholder="Typ je bericht..." />
        <button id="send-btn">Verstuur</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  const chatBtn = document.getElementById("chat-button");
  const chatBox = document.getElementById("chat-box");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const messages = document.getElementById("chat-messages");

  // Toon/verberg chatvenster
  chatBtn.addEventListener("click", () => {
    chatBox.style.display = chatBox.style.display === "none" ? "flex" : "none";
  });

 /* === HELPER FUNCTIE OM BERICHTEN TOE TE VOEGEN === */
function addMessage(message, sender = "bot") {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  // Zet Markdown om naar HTML met Showdown
  const converter = new showdown.Converter();
  const html = converter.makeHtml(message);

  msg.innerHTML = html;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}


  // Verstuur bericht naar N8N
  async function sendMessage() {
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;
    addMessage(userMsg, "user");
    chatInput.value = "";

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: userMsg })
      });
      const data = await res.json();
      if (data.image) {
        addMessage(`${data.text}<br><img src="${data.image}" style="max-width:100%;margin-top:6px;border-radius:8px;">`, "bot");
      } else if (data.text) {
        addMessage(data.text, "bot");
      } else if (data.output) {
        addMessage(data.output, "bot");
      } else {
        addMessage("Ik kon even geen passend antwoord vinden 🤔", "bot");
      }
    } catch (err) {
      console.error(err);
      addMessage("⚠️ Er ging iets mis bij het verbinden met de server.", "bot");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
})();
