    
    let fontSize = 18;
    let lineHeight = 1.6;
    const dropdown = document.getElementById('dropdown');
    const body = document.body;
    
    // Load settings from localStorage
    function setThemeColor(colorHex) {
    // Chrome, Firefox, Edge
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = "theme-color";
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute("content", colorHex);

    // Windows Phone
    let msNavColorMeta = document.querySelector('meta[name="msapplication-navbutton-color"]');
    if (!msNavColorMeta) {
      msNavColorMeta = document.createElement('meta');
      msNavColorMeta.name = "msapplication-navbutton-color";
      document.head.appendChild(msNavColorMeta);
    }
    msNavColorMeta.setAttribute("content", colorHex);

    // Optional: iOS Safari - limited JS support
    // This one does NOT update dynamically via JS — added here just for completeness.
    // iOS needs color to be handled via manifest/splash or native PWA install settings.
  }
  
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
    if(theme == ''){
        
    }else{
      body.classList.add(theme);

        //document.querySelector("meta[name='theme-color']").setAttribute("content", "#F0F5FF");
        setThemeColor("#060A14");
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
        setThemeColor("#060A14");
    
        }else{
                  setThemeColor("#F0F5FF");

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
    
   