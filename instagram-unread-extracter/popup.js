// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const unreadList = document.getElementById('unreadMessages');
  const messageCountDiv = document.querySelector('.message-count');

  messageCountDiv.classList.add('loading'); // Add loading animation

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: getUnreadMessages, // Reference to the function that will run in the context of the page
      },
      (results) => {
        const unreadMessages = results[0]?.result || [];
        unreadList.innerHTML = ''; // Clear previous list
        messageCountDiv.classList.remove('loading'); // Remove loading animation

        if (unreadMessages.length > 0) {
          messageCountDiv.textContent = `${unreadMessages.length} unread message(s)`;
          unreadMessages.forEach((chatName) => {
            const listItem = document.createElement('li');
            listItem.textContent = chatName; // Display the chat name
            unreadList.appendChild(listItem);
          });
        } else {
          messageCountDiv.textContent = 'No unread messages to display.';
        }
      }
    );
  });
});

// Function to get unread messages from the Instagram page context
function getUnreadMessages() {
  const unreadChats = [];

  // Find all list items that represent chat messages
  const chatItems = document.querySelectorAll('div[role="listitem"]');

  if (chatItems.length === 0) {
    console.log('No chat items found.');
  }

  chatItems.forEach((item) => {
    // Check for the blue dot indicating an unread message
    const unreadIndicator = item.querySelector('span[data-visualcompletion="ignore"]');
    
    if (unreadIndicator) {
      // Extract the username from the relevant span
      const usernameElement = item.querySelector('span.x1lliihq.x193iq5w'); // Adjust based on your structure
      const username = usernameElement ? usernameElement.innerText : "Unknown User";

      console.log(`Unread message detected from: ${username}`);
      unreadChats.push(username); // Store the username
    }
  });

  return unreadChats;
}
