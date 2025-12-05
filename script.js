(function(){
  const maleBtn = document.getElementById('maleBtn');
  const femaleBtn = document.getElementById('femaleBtn');
  const calcBtn = document.getElementById('calcBtn');
  const ageInput = document.getElementById('age');
  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');
  const bmiValueEl = document.getElementById('bmiValue');
  const bmiTextEl = document.getElementById('bmiText');
  const clearSavedBtn = document.getElementById('clearSavedBtn');
  const savedInfo = document.getElementById('savedInfo');

  let gender = 'male';

  function setActive(btn){
    maleBtn.classList.remove('active');
    femaleBtn.classList.remove('active');
    btn.classList.add('active');
  }

  maleBtn.addEventListener('click', ()=>{ gender='male'; setActive(maleBtn); });
  femaleBtn.addEventListener('click', ()=>{ gender='female'; setActive(femaleBtn); });

  function classify(bmi){
    if (bmi < 16) return 'Severely underweight';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    if (bmi < 35) return 'Obese';
    return 'Extremely obese';
  }

  function round(n, decimals=2){
    const p = Math.pow(10, decimals);
    return Math.round(n * p) / p;
  }

  calcBtn.addEventListener('click', ()=>{
    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);

    if (!h || !w){
      alert('Please enter valid height and weight values');
      return;
    }

    const heightM = h / 100;
    const bmi = w / (heightM * heightM);
    const bmiRounded = round(bmi, 2);

    bmiValueEl.textContent = bmiRounded.toFixed(2);
    bmiTextEl.textContent = classify(bmiRounded);
    // because i want to save last result to local variables and auto-save to localStorage
    lastResult = {
      age: ageInput.value || '',
      height: h,
      weight: w,
      gender: gender,
      bmi: bmiRounded,
      category: classify(bmiRounded),
      timestamp: Date.now()
    };
    
    try{
      localStorage.setItem('bmi_last', JSON.stringify(lastResult));
      savedInfo.textContent = 'Auto-saved last result.';
    }catch(e){
      console.warn('Auto-save failed', e);
    }
    //it applies color-coded class based on category
    applyCategoryClass(lastResult.bmi);
    showSavedInfo();
  });

  // localStorage helpers
  let lastResult = null;

  // Theme (dark mode) helpers
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'theme'; // stored value: 'dark' or 'light'

  function applyTheme(theme){
    const root = document.documentElement;
    if (theme === 'dark'){
      root.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.setAttribute('aria-pressed','true');
      if (themeToggle) themeToggle.textContent = '☀️';
    } else {
      root.removeAttribute('data-theme');
      if (themeToggle) themeToggle.setAttribute('aria-pressed','false');
      if (themeToggle) themeToggle.textContent = '🌙';
    }
  }

  function saveTheme(theme){
    try{ localStorage.setItem(THEME_KEY, theme); }catch(e){/*ignore*/}
  }

  function loadTheme(){
    try{
      const t = localStorage.getItem(THEME_KEY);
      if (t === 'dark' || t === 'light') return t;
    }catch(e){ }
    // fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  function toggleTheme(){
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  }

  if (themeToggle){
    themeToggle.addEventListener('click', toggleTheme);
  }

  function showSavedInfo(){
    if (!lastResult) return savedInfo.textContent = '';
    const d = new Date(lastResult.timestamp);
    savedInfo.textContent = `Last calculation — BMI: ${lastResult.bmi.toFixed(2)} (${lastResult.category}) — ${d.toLocaleString()}`;
  }

  function loadSaved(){
    try{
      const raw = localStorage.getItem('bmi_last');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return obj;
    }catch(e){
      console.error('Failed to parse saved data', e);
      return null;
    }
  }

  function populateFrom(obj){
    if (!obj) return;
    ageInput.value = obj.age || '';
    heightInput.value = obj.height || '';
    weightInput.value = obj.weight || '';
    gender = obj.gender || 'male';
    setActive(gender === 'male' ? maleBtn : femaleBtn);
    bmiValueEl.textContent = (obj.bmi != null) ? Number(obj.bmi).toFixed(2) : '—';
    bmiTextEl.textContent = obj.category || '—';
    lastResult = obj;
    applyCategoryClass(obj.bmi);
    showSavedInfo();
  }
  clearSavedBtn.addEventListener('click', ()=>{
    localStorage.removeItem('bmi_last');
    lastResult = null;
    savedInfo.textContent = 'Cleared saved result.';
    // clear UI outputs
    bmiValueEl.textContent = '—';
    bmiTextEl.textContent = '—';
    // remove any category class on the card
    document.querySelector('.card').classList.remove(
      'category-severely-underweight','category-underweight','category-normal','category-overweight','category-obese','category-extremely-obese'
    );
  });

  // On load, populate UI from saved (handle both cases whether DOMContentLoaded already fired)
  function init(){
    const loaded = loadSaved();
    if (loaded) populateFrom(loaded);
    // apply saved or preferred theme
    const theme = loadTheme();
    applyTheme(theme);
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function applyCategoryClass(bmi){
    const card = document.querySelector('.card');
    if (!card) return;
    // remove existing category classes
    card.classList.remove('category-severely-underweight','category-underweight','category-normal','category-overweight','category-obese','category-extremely-obese');
    if (bmi == null || isNaN(bmi)) return;
    let cls = '';
    if (bmi < 16) cls = 'category-severely-underweight';
    else if (bmi < 18.5) cls = 'category-underweight';
    else if (bmi < 25) cls = 'category-normal';
    else if (bmi < 30) cls = 'category-overweight';
    else if (bmi < 35) cls = 'category-obese';
    else cls = 'category-extremely-obese';
    card.classList.add(cls);
  }
})();
