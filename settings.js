    
    let fontSize = 18;
    let lineHeight = 1.6;
    const dropdown = document.getElementById('dropdown');
    const body = document.body;
    
    // Load settings from localStorage
    function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('uiSettings') || '{}');
    fontSize = settings.fontSize || 20;
    lineHeight = settings.lineHeight || 1.6;
    const theme = settings.theme || '';
    const nightLight = settings.nightLight || false;
    const fontFamily = settings.fontFamily || "Poppins";
    
    // Apply loaded settings
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--line-height', lineHeight);
    document.documentElement.style.setProperty('--font-family', fontFamily);
    body.classList.remove('dark-mode');
    body.classList.add(theme);
    if(theme == ''){
        
    }else{
        document.querySelector("meta[name='theme-color']").setAttribute("content", "#F0F5FF");
    }
    if (nightLight) {
    body.classList.add('night-light');
    dropdown.classList.add('night-light');
    }
    }
    
    // Save settings to localStorage
    function saveSettings() {
    const settings = {
    fontSize: fontSize,
    lineHeight: lineHeight,
    theme: body.classList.contains('dark-mode') ? 'dark-mode' : '',
    nightLight: body.classList.contains('night-light'),
    fontFamily: document.documentElement.style.getPropertyValue('--font-family') || "'Georgia', serif"
    };
    localStorage.setItem('uiSettings', JSON.stringify(settings));
    }
    
    // Initialize settings on page load
    loadSettings();
    
    function toggleDropdown() {
    dropdown.classList.toggle('show');
    
    }
    
    function adjustFontSize(change) {
    fontSize = Math.max(12, Math.min(24, fontSize + change));
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    saveSettings();
    }
    
    function adjustLineHeight(change) {
    lineHeight = Math.max(1.2, Math.min(2.0, lineHeight + change));
    document.documentElement.style.setProperty('--line-height', lineHeight);
    saveSettings();
    }
    
    function toggleTheme() {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
            document.querySelector("meta[name='theme-color']").setAttribute("content", "#F0F5FF");
    
        }
    saveSettings();
    }
    
    function toggleNightLight() {
    body.classList.toggle('night-light');
    dropdown.classList.toggle('night-light');
    saveSettings();
    }
    
    function changeFont(font) {
    document.documentElement.style.setProperty('--font-family', font);
    saveSettings();
    }
    
    document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target) && !event.target.closest('.fab')) {
    dropdown.classList.remove('show');
    }
    });