document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatMessages = document.getElementById("chatMessages");
  const sendButton = document.getElementById("sendButton");

  // Auto-resize the textarea
  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = `${userInput.scrollHeight}px`;
  });

  // Handle form submission
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form behavior

    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, true);

    // Clear input and reset height
    userInput.value = "";
    userInput.style.height = "auto";

    // Disable send button during processing
    sendButton.disabled = true;

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    try {
      // Generate AI response
      const response = await generateResponse(message);
      typingIndicator.remove(); // Remove typing indicator
      addMessage(response, false); // Add AI response to chat
    } catch (error) {
      typingIndicator.remove(); // Remove typing indicator on error
      addErrorMessage(error.message); // Display error message
    } finally {
      sendButton.disabled = false; // Re-enable send button
    }
  });

  /**
   * Generates a response from the Gemini API.
   * @param {string} prompt - The user's input message.
   * @returns {Promise<string>} - The AI-generated response.
   */
  async function generateResponse(prompt) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBr9Eux7OBl_OzHpZfA-dcpr2V2Zvxia0M`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate a response. Please try again later.");
    }
  }

  /**
   * Adds a message to the chat container.
   * @param {string} text - The message content.
   * @param {boolean} isUser - Whether the message is from the user.
   */
  function addMessage(text, isUser) {
    const message = document.createElement("div");
    message.className = `message ${isUser ? "user-message" : ""}`;
    message.innerHTML = `
      <div class="avatar ${isUser ? "user-avatar" : ""}">
        ${isUser ? "U" : "AI"}
      </div>
      <div class="message-content">${text}</div>
    `;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
  }

  /**
   * Shows a typing indicator in the chat container.
   * @returns {HTMLElement} - The typing indicator element.
   */
  function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "message";
    indicator.innerHTML = `
      <div class="avatar">AI</div>
      <div class="typing-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    return indicator;
  }

  /**
   * Adds an error message to the chat container.
   * @param {string} text - The error message content.
   */
  function addErrorMessage(text) {
    const message = document.createElement("div");
    message.className = "message";
    message.innerHTML = `
      <div class="avatar">AI</div>
      <div class="message-content" style="color: red;">
        Error: ${text}
      </div>
    `;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
  }
});
