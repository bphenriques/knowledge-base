(function () {
    document
      .querySelectorAll(".highlight")
      .forEach((highlightDiv) => createCopyButton(highlightDiv));

    function createCopyButton(highlightDiv) {
      const button = document.createElement("button");
      button.className = "copy-code-button";
      button.type = "button";
      button.innerText = "Copy";
      button.addEventListener("click", () =>
        copyCodeToClipboard(button, highlightDiv)
      );
      highlightDiv.insertBefore(button, highlightDiv.firstChild);
    }

    async function copyCodeToClipboard(button, highlightDiv) {
      const codeToCopy = highlightDiv.querySelector("pre").innerText;
      button.blur();

      try {
        result = await navigator.permissions.query({ name: "clipboard-write" });
        if (result.state == "granted" || result.state == "prompt") {
          await navigator.clipboard.writeText(codeToCopy);
          button.innerText = "Copied!";
        } else {
          button.innerText = "Permission denied!";
          copyCodeBlockExecCommand(codeToCopy, highlightDiv);
        }
      } catch (_) {
          button.innerText = "Error!";
      } finally {
        setTimeout(() => { button.innerText = "Copy"; }, 2000);
      }
    }
})();
