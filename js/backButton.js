function initializeBackButton() {
  const backButton = document.querySelector(".back-button");

  if (!backButton) {
    return;
  }

  backButton.addEventListener("click", handleBackNavigation);
}

function handleBackNavigation(event) {
  event.preventDefault();

  if (document.referrer) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
}

export { initializeBackButton };
