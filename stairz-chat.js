(() => {
  const config = {
    webhook: "https://n8n.srv880919.hstgr.cloud/webhook/a476be50-de85-41ed-8195-3da36aeb0a51/chat",
    position: "right", // "left" of "right"
    primaryColor: "#854fff",
    name: "Stairz Traprenovatie",
    welcomeText: "Hoi 👋, welkom bij Stairz Traprenovatie! Waarmee kunnen we je helpen vandaag?",
  };

  // === Hoofdcontainer ===
  const chat = document.createElement("div");
  chat.id = "stairz-widget";
  chat.style.cssText = `
    position: fixed;
    bottom: 20px;
    ${config.position}: 20px;
    width: 360px;
    height: 480px;
    background: #fff;
    box-shadow: 0 0 15px rgba(0,0,0,0.2);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    font-family: 'Poppins', sans-serif;
    z-index: 9999;
  `;
  document.body.appendChild(chat);

  // === HTML structuur ===
  chat.innerHTML = `
    <div id="chat-header"
         style="background:${config.primaryColor};
                color:white;
                padding:12px;
                font-weight:600;
                border-radius:12px 12px 0 0;">
      ${config.name}
    </div>
    <div id="chat-messages"
         style="flex:1;
                overflow-y:auto;
                padding:12px;
                background:#fafafa;"></div>
    <div id="chat-input-bar"
         style="display:flex;
                border-top:1px solid #eee;">
      <input id="chat-input"
             placeholder="Typ je bericht..."
             style="flex:1;
                    border:none;
                    padding:10px;
                    font-size:14px;
                    outline:none;">
      <button id="chat-send"
              style="background:${config.primaryColor};
                     color:white;
                     border:none;
                     padding:10px 16px;
                     cursor:pointer;">
        Verstuur
      </button>
    </div>
  `;

  const messages = chat.querySelector("#chat-messages");
  const input = chat.querySelector("#chat-input");
  const sendBtn = chat.querySelector("#chat-send");

  // === Bericht toevoegen aan venster ===
  function appendMessage(text, type = "user", image = null) {
    const msg = document.createElement("div");
    msg.style.cssText = `
      background:${type === "user" ? config.primaryColor : "#f4f4f4"};
      color:${type === "user" ? "white" : "#333"};
      padding:8px 10px;
      border-radius:8px;
      margin:6px 0;
      max-width:80%;
      word-wrap:break-word;
      ${type === "user" ? "margin-left:auto" : ""}
    `;
    msg.textContent = text;
    messages.appendChild(msg);

    if (image) {
      const img = document.createElement("img");
      img.src = image;
      img.alt = "Voorbeeld trapdecor";
      img.style.cssText = `
        width:100%;
        margin-top:6px;
        border-radius:8px;
        box-shadow:0 0 4px rgba(0,0,0,0.1);
      `;
      messages.appendChild(img);
    }

    messages.scrollTop = messages.scrollHeight;
  }

  // === Bericht versturen ===
 async function sendMessage(message) {
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatInput: message })
  });

  if (!response.ok) {
    addMessage("⚠️ Er ging iets mis bij het verbinden met de server.");
    return;
  }

  const data = await response.json();

  // ✅ Toon afbeelding als die er is
  if (data.image) {
    addMessage(`<strong>${data.text}</strong><br><img src="${data.image}" alt="decor voorbeeld" style="max-width: 100%; border-radius: 10px; margin-top: 8px;">`);
  } else if (data.text) {
    addMessage(data.text);
  } else {
    addMessage("Ik kon even geen passend antwoord vinden 🤔");
  }
}

  // === Event Listeners ===
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // === Welkomstbericht ===
  appendMessage(config.welcomeText, "bot");
})();
