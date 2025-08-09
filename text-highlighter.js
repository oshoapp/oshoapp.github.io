 //const fileName = "highlights";
    
    

const colors = ['#fde047', '#a7f3d0', '#bfdbfe', '#fecaca', '#dbeafe', '#fbcfe8'];
let selectedColor = colors[0];
let currentActiveStyledElement = null;
const highlightsMap = new Map();
const storedHighlightObj = {};

const preHighlights = loadHighlightsFromStorage(fileName);

const padding = 16;
const paddingV = 72; //56 + 16
   
   
const contentParagraph = document.getElementById('content-paragraph');
const highlightToolbar = document.getElementById('highlight-toolbar');
const applyHighlightBtn = document.getElementById('apply-highlight-btn');
const copyBtn = document.getElementById('copy-btn');

const applyUnderlineBtn = document.getElementById('apply-underline-btn');
const deleteStyleBtn = document.getElementById('delete-style-btn');
const colorPalette = document.getElementById('color-palette');

let windowWidth = document.documentElement.clientWidth;



function populateColorPalette() {
    colorPalette.innerHTML = ''; // clear previous palette
    
    colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.classList.add('color-option');
        colorOption.style.backgroundColor = color;
        colorOption.dataset.color = color;
        colorOption.addEventListener('click', () => {
            selectedColor = color;
            document.querySelectorAll('.color-option').forEach(opt => opt.style.borderColor = 'transparent');
            colorOption.style.borderColor = '#fff';
    
            if (currentActiveStyledElement) {
                const type = currentActiveStyledElement.dataset.styleType;
                if (type === 'highlight') {
                    currentActiveStyledElement.style.backgroundColor = selectedColor;
        
                    // 🔥 Add this block to ensure text color adjusts for highlight
                    const rgb = getRGB(selectedColor);
                    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
                    currentActiveStyledElement.style.color = luminance < 0.5 ? '#fff' : '#000';
        
                } else if (type === 'underline') {
                    currentActiveStyledElement.style.textDecorationColor = selectedColor;
                    // leave text color unchanged
                }
        
                currentActiveStyledElement.dataset.color = selectedColor;
                highlightsMap.set(currentActiveStyledElement.dataset.id, {
                    text: currentActiveStyledElement.textContent,
                    color: selectedColor,
                    styleType: type
                    //startOffset: getNodeOffset(currentActiveStyledElement),
                    //endOffset: getNodeOffset(currentActiveStyledElement) + currentActiveStyledElement.textContent.length
                });
                saveHighlightsToStorage(highlightsMap);
            }
        });
        
        colorPalette.appendChild(colorOption);
        Coloris({
          themeMode: 'dark',
          alpha: false,
          clearButton: false,
          closeButton: false
        });
    });
    
    // Add the color picker at the end
    const pickerDiv = document.createElement('div');
    pickerDiv.classList.add('color-option', 'picker');
    pickerDiv.innerHTML = '<input type="text" class="picker-input" data-coloris>';
    colorPalette.appendChild(pickerDiv);
    const pickerInput = document.querySelector('.picker-input');
    
    let lastColorUsed = '';

    pickerInput.addEventListener('input', (e) => {
        const liveColor = e.target.value;
        lastColorUsed = liveColor;
        selectedColor = liveColor; // 🔥 important to apply in next highlight
        applyColorToSelection(liveColor);
    });

    pickerInput.addEventListener('change', (e) => {
        const finalColor = e.target.value;
        selectedColor = finalColor;
        
        if (!colors.includes(finalColor)) {
            colors.unshift(finalColor);
            if (colors.length > 6) colors.pop();
            populateColorPalette();
        }
    });

    pickerInput.addEventListener('blur', () => {
        if (!colors.includes(lastColorUsed)) {
            colors.unshift(lastColorUsed);
            if (colors.length > 6) colors.pop();
            populateColorPalette(); // re-render
        }
    });

    const initialSelectedOption = document.querySelector(`.color-option[data-color="${selectedColor}"]`);
    if (initialSelectedOption) initialSelectedOption.style.borderColor = '#fff';
}

function getNodeOffset(node) {
    let offset = 0;
    let current = node;
    while (current.previousSibling) {
        current = current.previousSibling;
        if (current.nodeType === Node.TEXT_NODE) {
            offset += current.textContent.length;
        } else if (current.nodeType === Node.ELEMENT_NODE) {
            offset += current.textContent.length;
        }
    }
    return offset;
}
    
function loadHighlightsFromStorage() {
  const stored = localStorage.getItem(fileName);
  if (!stored) return [];

  const storedHighlightObj = JSON.parse(stored);
  return Object.entries(storedHighlightObj).map(([id, data]) => ({
    ...data,
    id
  }));
}
    
function saveHighlightsToStorage(highlightsMap) {
    const objToStore = Object.fromEntries(highlightsMap);
    localStorage.setItem(fileName, JSON.stringify(objToStore));
   // console.log(JSON.stringify(Object.fromEntries(highlightsMap), null, 2));

}

    function applyPreHighlights() {
        const text = contentParagraph.textContent;
        preHighlights.forEach(({ text: highlightText, color, styleType, id }) => {
            
            const startIndex = text.indexOf(highlightText);
            if (startIndex === -1) return;

            const range = document.createRange();
            let currentOffset = 0;
            let foundNode = null;
            let startNodeOffset = 0;

            const walker = document.createTreeWalker(contentParagraph, NodeFilter.SHOW_TEXT, null);
            while (walker.nextNode()) {
                const node = walker.currentNode;
                const nodeLength = node.textContent.length;
                if (currentOffset + nodeLength > startIndex) {
                    startNodeOffset = startIndex - currentOffset;
                    foundNode = node;
                    break;
                }
                currentOffset += nodeLength;
            }

            if (foundNode) {
                range.setStart(foundNode, startNodeOffset);
                range.setEnd(foundNode, startNodeOffset + highlightText.length);

                const span = document.createElement('span');
                span.style.color = 'inherit';
                span.dataset.styleType = styleType;
                span.dataset.color = color;
                span.dataset.id = id;
                if (styleType === 'highlight') {
                    span.classList.add('highlighted');
                    span.style.backgroundColor = color;
                    
                    const rgb = getRGB(color);
                    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
                    span.style.color = luminance < 0.5 ? '#fff' : '#000';

                } else if (styleType === 'underline') {
                    span.classList.add('underlined');
                    span.style.textDecorationColor = color;
                }
                range.surroundContents(span);

                highlightsMap.set(id, {
                    text: highlightText,
                    color,
                    styleType
                    //startOffset: startIndex,
                    //endOffset: startIndex + highlightText.length
                });
                
            }
        });
    }

    function getSelectionRange() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (contentParagraph.contains(range.commonAncestorContainer)) {
                return range;
            }
        }
        return null;
    }

    function applyColorToSelection(color) {
        if (!currentActiveStyledElement) return;
    
        const type = currentActiveStyledElement.dataset.styleType;
    
        if (type === 'highlight') {
            currentActiveStyledElement.style.backgroundColor = color;
            
            // Check luminance & set text color based on brightness
            const rgb = getRGB(color);
            const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    
            if (luminance < 0.5) {
                currentActiveStyledElement.style.color = '#fff';
            } else {
                currentActiveStyledElement.style.color = '#000';
            }
    
        } else if (type === 'underline') {
            currentActiveStyledElement.style.textDecorationColor = color;
            // DO NOT mess with text color for underline
        }
    
        currentActiveStyledElement.dataset.color = color;
    
        highlightsMap.set(currentActiveStyledElement.dataset.id, {
    text: currentActiveStyledElement.textContent,
    color: color,
    styleType: type
   // startOffset: getNodeOffset(currentActiveStyledElement),
//    endOffset: getNodeOffset(currentActiveStyledElement) + currentActiveStyledElement.textContent.length
});
saveHighlightsToStorage(highlightsMap);
    }

    function getBrightness(rgbString) {
        const [r, g, b] = rgbString.match(/\d+/g).map(Number);
        // Standard brightness formula
        return (r * 299 + g * 587 + b * 114) / 1000;
    }
    
    function getRGB(hex) {
        const cleanHex = hex.replace('#', '');
        const bigint = parseInt(cleanHex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }

    function getLuminance(r, g, b) {
        const [R, G, B] = [r, g, b].map(c => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }

    function getContrastColor(hex) {
        // Convert hex to RGB
        let r = 0, g = 0, b = 0;
    
        if (hex.startsWith('#')) {
            hex = hex.slice(1);
        }
    
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
    
        // Calculate luminance
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
        // Use white for dark backgrounds, black for light ones
        return luminance < 128 ? '#fff' : '#000';
    }

    function showToolbar(target, isEditMode = false, x = null, y = null) {
        const range = getSelectionRange();
    
        let rect;
    
        if (isEditMode && target) {
            rect = target.getBoundingClientRect();
            x = x ?? rect.left + rect.width / 2;
            y = y ?? rect.top;
        
        } else if (range) {
            rect = range.getBoundingClientRect();
            x = x || rect.left + (rect.width / 2);
            y = y || rect.top;
            
        } else {
            hideToolbar();
            return;
        }

        applyHighlightBtn.classList.toggle('hidden', isEditMode);
        applyHighlightBtn.classList.toggle('visible', !isEditMode);
        applyUnderlineBtn.classList.toggle('hidden', isEditMode);
        applyUnderlineBtn.classList.toggle('visible', !isEditMode);
        
        copyBtn.classList.toggle('hidden', isEditMode);
        copyBtn.classList.toggle('visible', !isEditMode);
        
        deleteStyleBtn.classList.toggle('hidden', !isEditMode);
        deleteStyleBtn.classList.toggle('visible', isEditMode);
        colorPalette.classList.toggle('hidden', !isEditMode);
        colorPalette.classList.toggle('visible', isEditMode);
    
        // Temporarily show toolbar offscreen to measure it
        highlightToolbar.style.left = '-9999px'; //-9999px
        highlightToolbar.style.top = '-9999px';
        
        
        highlightToolbar.classList.remove('hidden');
        highlightToolbar.classList.add('visible');
         //aage ka code stop
        
        // Now that it's visible, we can accurately measure
        const toolbarWidth = highlightToolbar.offsetWidth;
        
        const toolbarHeight = highlightToolbar.offsetHeight;
        
        const containerRect = contentParagraph.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        
        // X-axis positioning
    
        let toolbarLeft = x - (toolbarWidth / 2);

        toolbarLeft = Math.max(padding, Math.min(toolbarLeft, windowWidth - toolbarWidth - padding));
    
        toolbarLeft -= containerRect.left;
        
        

        //console.log("X is :" + x + "\nToolbar Width is " + toolbarWidth + "\ntoolbarleft gonna : " + toolbarLeft + "\nwindow width: " + windowWidth);

        // Y-axis positioning
        let toolbarTop = rect.top - containerRect.top - toolbarHeight + 32;
        if (toolbarTop < paddingV - containerRect.top) {
            //niche jao
            toolbarTop = rect.bottom - containerRect.top + paddingV + 24;
        }

        const absoluteTop = containerRect.top + toolbarTop;
        if (absoluteTop + toolbarHeight + paddingV > windowHeight) {
            toolbarTop = windowHeight - containerRect.top - toolbarHeight - paddingV;
        }
        if (absoluteTop < padding) {
            toolbarTop = paddingV - containerRect.top;
        }

        // Final placement
        highlightToolbar.style.left = `${toolbarLeft}px`;
        highlightToolbar.style.top = `${toolbarTop}px`;
    
        // Button visibility
        applyHighlightBtn.classList.toggle('hidden', isEditMode);
        applyHighlightBtn.classList.toggle('visible', !isEditMode);
        applyUnderlineBtn.classList.toggle('hidden', isEditMode);
        applyUnderlineBtn.classList.toggle('visible', !isEditMode);
        
        copyBtn.classList.toggle('hidden', isEditMode);
        copyBtn.classList.toggle('visible', !isEditMode);
        
        deleteStyleBtn.classList.toggle('hidden', !isEditMode);
        deleteStyleBtn.classList.toggle('visible', isEditMode);
        colorPalette.classList.toggle('hidden', !isEditMode);
        colorPalette.classList.toggle('visible', isEditMode);
    }

    function hideToolbar() {
        highlightToolbar.classList.remove('visible');
        highlightToolbar.classList.add('hidden');
        if (currentActiveStyledElement) {
            currentActiveStyledElement.classList.remove('active');
            currentActiveStyledElement = null;
        }
    }

    function applyStyle(styleType) {
        const range = getSelectionRange();
        if (!range) return;
        hideToolbar();
        const selectedText = range.toString();
        const id = `highlight${Date.now()}`;
        const span = document.createElement('span');
    
        span.dataset.styleType = styleType;
        span.dataset.color = selectedColor;
        span.dataset.id = id;
    
        // Only handle background and text color for highlight
        if (styleType === 'highlight') {
            span.classList.add('highlighted');
            span.style.backgroundColor = selectedColor;
    
            // If highlight color is dark, switch text to white
            if (isColorDark(selectedColor)) {
                span.style.color = 'white';
            } else {
                span.style.color = 'black';
            }
    
        } else if (styleType === 'underline') {
            span.classList.add('underlined');
            span.style.textDecorationColor = selectedColor;
            span.style.color = 'inherit'; // Do NOT override text color for underline
        }
    
        try {
            range.surroundContents(span);
        } catch (e) {
            console.error("Could not surround contents:", e);
            if (selectedText) {
                const tempSpan = document.createElement('span');
                tempSpan.textContent = selectedText;
                tempSpan.dataset.styleType = styleType;
                tempSpan.dataset.color = selectedColor;
                tempSpan.dataset.id = id;
    
                if (styleType === 'highlight') {
                    tempSpan.classList.add('highlighted');
                    tempSpan.style.backgroundColor = selectedColor;
                    tempSpan.style.color = isColorDark(selectedColor) ? 'white' : 'black';
                } else if (styleType === 'underline') {
                    tempSpan.classList.add('underlined');
                    tempSpan.style.textDecorationColor = selectedColor;
                    tempSpan.style.color = 'inherit';
                }
    
                range.deleteContents();
                range.insertNode(tempSpan);
            }
        }
    
        highlightsMap.set(id, {
            text: selectedText,
            color: selectedColor,
            styleType
           // startOffset: getNodeOffset(span),
            // endOffset: getNodeOffset(span) + selectedText.length
        });
        saveHighlightsToStorage(highlightsMap);
        window.getSelection().removeAllRanges();
        hideToolbar();
    }

    function isColorDark(hex) {
        hex = hex.replace('#', '');
    
        // convert to RGB
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
    
        // Calculate luminance
        let luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    
        return luminance < 160; // tweak threshold if needed
    }

    function deleteStyle() {
        if (!currentActiveStyledElement) return;
        const id = currentActiveStyledElement.dataset.id;
        const parent = currentActiveStyledElement.parentNode;
        while (currentActiveStyledElement.firstChild) {
            parent.insertBefore(currentActiveStyledElement.firstChild, currentActiveStyledElement);
        }
        parent.removeChild(currentActiveStyledElement);
        highlightsMap.delete(id);
        saveHighlightsToStorage(highlightsMap);
        hideToolbar();
    }

    function handleSelection(event) {
        setTimeout(() => {
            const selection = window.getSelection();
            const range = getSelectionRange();
            if (range && !selection.isCollapsed && contentParagraph.contains(range.commonAncestorContainer)) {
                if (currentActiveStyledElement) {
                    currentActiveStyledElement.classList.remove('active');
                    currentActiveStyledElement = null;
                }
                let x, y;
                if (event.type === 'touchend') {
                    const touch = event.changedTouches[0];
                    x = touch.clientX;
                    y = touch.clientY;
                } else {
                    x = event.clientX;
                    y = event.clientY;
                }
                showToolbar(range, false, x, y);
            } else {
                if (!currentActiveStyledElement) hideToolbar();
            }
        }, 50);
    }

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    highlightToolbar.addEventListener('mousedown', (e) => {
        if (e.target.closest('button, .color-option')) return;
        e.preventDefault();
        isDragging = true;
        const rect = highlightToolbar.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
    });

/*    
// 1st working void
document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const containerRect = contentParagraph.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const toolbarWidth = highlightToolbar.offsetWidth;
        const toolbarHeight = highlightToolbar.offsetHeight;
        

        let newLeft = e.clientX - dragOffsetX - containerRect.left;
        let newTop = e.clientY - dragOffsetY - containerRect.top;

        newLeft = Math.max(padding, Math.min(newLeft, windowWidth - toolbarWidth - padding - containerRect.left));
        newTop = Math.max(paddingV - containerRect.top, Math.min(newTop, windowHeight - toolbarHeight - paddingV - containerRect.top));

        highlightToolbar.style.left = `${newLeft}px`;
        highlightToolbar.style.top = `${newTop}px`;
    }); 

// 2nd by chatgpt , can be deleted

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const containerRect = contentParagraph.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const toolbarWidth = highlightToolbar.offsetWidth;
    const toolbarHeight = highlightToolbar.offsetHeight;

    // Calculate raw position from drag
    let newLeft = e.clientX - dragOffsetX - containerRect.left;
    let newTop = e.clientY - dragOffsetY - containerRect.top;

    // === X-axis constraint (same logic as showToolbar) ===
    const maxLeft = windowWidth - toolbarWidth - padding;
    newLeft = Math.max(
        padding - containerRect.left,
        Math.min(newLeft, maxLeft - containerRect.left)
    );

    // === Y-axis constraint (mirroring showToolbar bounds) ===
    const minTop = paddingV - containerRect.top; // Top limit
    const maxTop = windowHeight - toolbarHeight - paddingV - containerRect.top; // Bottom limit
    newTop = Math.max(minTop, Math.min(newTop, maxTop));

    // Apply position
    highlightToolbar.style.left = `${newLeft}px`;
    highlightToolbar.style.top = `${newTop}px`;
});
*/
//3rd by chatgpt>>>

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const toolbarWidth = highlightToolbar.getBoundingClientRect().width;
    const toolbarHeight = highlightToolbar.getBoundingClientRect().height;

    let newLeft = e.clientX - dragOffsetX; // no containerRect.left subtraction
    let newTop = e.clientY - dragOffsetY;  // no containerRect.top subtraction

    const minLeft = padding;
    const maxLeft = viewportWidth - toolbarWidth - padding;
    newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));

    const minTop = paddingV;
    const maxTop = viewportHeight - toolbarHeight - paddingV;
    newTop = Math.max(minTop, Math.min(newTop, maxTop));

    highlightToolbar.style.left = `${newLeft}px`;
    highlightToolbar.style.top = `${newTop}px`;
});





document.addEventListener('mouseup', () => {
    isDragging = false;
});
    

highlightToolbar.addEventListener('touchstart', (e) => {
    if (e.target.closest('button, .color-option')) return;
    e.preventDefault();
    isDragging = true;

    const touch = e.touches[0];
    const rect = highlightToolbar.getBoundingClientRect();
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const toolbarWidth = highlightToolbar.getBoundingClientRect().width;
    const toolbarHeight = highlightToolbar.getBoundingClientRect().height;

    let newLeft = touch.clientX - dragOffsetX;
    let newTop = touch.clientY - dragOffsetY;

    const minLeft = padding;
    const maxLeft = viewportWidth - toolbarWidth - padding;
    newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));

    const minTop = paddingV;
    const maxTop = viewportHeight - toolbarHeight - paddingV;
    newTop = Math.max(minTop, Math.min(newTop, maxTop));

    highlightToolbar.style.left = `${newLeft}px`;
    highlightToolbar.style.top = `${newTop}px`;
});


document.addEventListener('touchend', () => {
    isDragging = false;
});

populateColorPalette();
applyPreHighlights();

contentParagraph.addEventListener('mouseup', handleSelection);
contentParagraph.addEventListener('touchend', handleSelection);
contentParagraph.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    handleSelection(event);
});

//When container text is clicked (either annoted or if normal then hide toolbar if visible)
contentParagraph.addEventListener('click', (e) => {
    let target = e.target;
    while (target && target !== contentParagraph && !target.classList.contains('highlighted') && !target.classList.contains('underlined')) {
        target = target.parentNode;
    }
    if (target && (target.classList.contains('highlighted') || target.classList.contains('underlined'))) {
        if (currentActiveStyledElement && currentActiveStyledElement !== target) {
            currentActiveStyledElement.classList.remove('active');
        }
        currentActiveStyledElement = target;
        currentActiveStyledElement.classList.add('active');
        window.getSelection().removeAllRanges();
        showToolbar(currentActiveStyledElement, true);
    } else {
        hideToolbar();
    }
});

highlightToolbar.addEventListener('mousedown', (e) => {
    if (e.target.closest('button, .color-option')) e.preventDefault();
});

//highlight button
applyHighlightBtn.addEventListener('click', () => applyStyle('highlight'));
//copy button
copyBtn.addEventListener('click', () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (selectedText.trim() !== "") {
        try {
            navigator.clipboard.writeText(selectedText).then(() => {
                console.log("Text copied to clipboard");
            }).catch(err => {
                console.error("Failed to copy: ", err);
            });
        } catch (err) {
            console.error("Clipboard access error: ", err);
        }
    }

    selection.removeAllRanges();
    hideToolbar();
});
// underline button
applyUnderlineBtn.addEventListener('click', () => applyStyle('underline'));
//delete button
deleteStyleBtn.addEventListener('click', deleteStyle);

// Re-show Toolbar if window resized
window.addEventListener('resize', () => {
    if (highlightToolbar.classList.contains('visible')) {
        if (currentActiveStyledElement) {
            showToolbar(currentActiveStyledElement, true);
        } else {
            const range = getSelectionRange();
            if (range) showToolbar(range, false);
            else hideToolbar();
        }
    }
});
// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // CTRL + U
    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault(); // stop browser default action
        applyStyle('underline');
        // Your custom function here
    }
    
    // DELETE
    if (e.key === 'Delete') {
        deleteStyle();
        
    }
    
    // CTRL + SPACE
    if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        applyStyle('highlight');
    }
});