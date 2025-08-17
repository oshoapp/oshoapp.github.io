    const textarea = document.getElementById("share-text");

function toggleShare() {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    const shareText = document.getElementById('share-text');
    shareText.innerText = "";
    shareText.innerText = selectedText;
    shareTextDynamicSize();

    document.querySelector(".share-overlay").classList.toggle('show');
    hideToolbar();
}

function shareTextDynamicSize() {
    // tweak these
    let fontMultiplier = 40;        // starting font size (px) at 0 chars
    let shrinkRate = 0.3;           // how much to shrink per char (px)
    let lineHeightMultiplier = 1.2; // affects line height scaling

    const length = textarea.value.length || 1;

    // linear shrink
    const fontSize = Math.max(12, fontMultiplier - (length * shrinkRate));
    const lineHeight = fontSize * lineHeightMultiplier;

    textarea.style.fontSize = fontSize + "px";
    textarea.style.lineHeight = lineHeight + "px";
}


textarea.addEventListener("input", shareTextDynamicSize);
textarea.addEventListener("change", shareTextDynamicSize);
