// Global Set to store previously detected unread messages
const allUnreadMessages = new Set();

document.addEventListener('DOMContentLoaded', () => {
  const unreadList = document.getElementById('unreadMessages');
  const messageCountDiv = document.querySelector('.message-count');

  messageCountDiv.classList.add('loading'); // Add loading animation

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    // Function to update unread messages
    const updateUnreadMessages = async () => {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: scrollAndGetUnreadMessages, // Call the scrolling function
      });

      const unreadMessages = results[0]?.result || [];
      messageCountDiv.classList.remove('loading'); // Remove loading animation

      // Update global set with new unread messages
      unreadMessages.forEach((chatName) => {
        allUnreadMessages.add(chatName);
      });

      // Clear the list for new updates
      unreadList.innerHTML = '';

      // Display all unread messages
      allUnreadMessages.forEach((chatName) => {
        const listItem = document.createElement('li');
        listItem.textContent = chatName; // Display the chat name
        unreadList.appendChild(listItem);
      });

      messageCountDiv.textContent = `${allUnreadMessages.size} unread message(s)`;
    };

    // Start checking for unread messages every few seconds
    const intervalId = setInterval(updateUnreadMessages, 50); // Check every 5 seconds

    // Clear the interval when the popup is closed
    window.addEventListener('unload', () => {
      clearInterval(intervalId);
    });

    // Initial call to update unread messages
    updateUnreadMessages();
  });
});

// Function to scroll and get unread messages
async function scrollAndGetUnreadMessages() {
  const unreadChats = [];
  const messagesContainer = document.querySelector('div[role="presentation"]');

  if (!messagesContainer) {
    console.log('Messages container not found.');
    return [];
  }

  console.log('Starting to scroll...'); // Log when scrolling starts

  const scrollDuration = 10000; // Scroll for 10 seconds
  const scrollStep = 200; // Scroll down by 200 pixels
  const totalScrolls = scrollDuration / 200; // Total scrolls
  let currentScroll = 0;

  // Scroll down
  while (currentScroll < totalScrolls) {
    messagesContainer.scrollTop += scrollStep; // Scroll down
    currentScroll++;
    await new Promise(resolve => setTimeout(resolve, 200)); // Wait for 200 milliseconds
  }

  console.log('Finished scrolling.'); // Log when scrolling ends

  // Get unread messages after scrolling
  const chatItems = document.querySelectorAll('div[role="listitem"]');

  chatItems.forEach((item) => {
    const unreadIndicator = item.querySelector('span[data-visualcompletion="ignore"]');

    if (unreadIndicator) {
      const usernameElement = item.querySelector('span.x1lliihq.x193iq5w'); // Adjust based on your structure
      const username = usernameElement ? usernameElement.innerText : "Unknown User";
      unreadChats.push(username);
    }
  });

  return unreadChats;
}
