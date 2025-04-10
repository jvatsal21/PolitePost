const controls = ['politeness', 'humor', 'conciseness'];

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(controls, (data) => {
    controls.forEach((key) => {
      const input = document.getElementById(key);
      input.value = data[key] || 3;

      input.addEventListener('input', () => {
        chrome.storage.local.set({ [key]: parseInt(input.value) }, () => {
          document.getElementById('status').textContent = "Saved!";
          setTimeout(() => {
            document.getElementById('status').textContent = "";
          }, 1000);
        });
      });
    });
  });
});
