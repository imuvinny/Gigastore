const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `  useEffect(() => {
    async function fetchData() {`;
    
const newTarget = `  useEffect(() => {
    if (supabase) {
      const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
      if (!localStorage.getItem('visitor_id')) localStorage.setItem('visitor_id', visitorId);
      supabase.from('visits').insert([{ page_path: window.location.pathname, visitor_id: visitorId }]).then(()=>{});
    }
  }, []);

  useEffect(() => {
    async function fetchData() {`;

code = code.replace(target, newTarget);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with visits tracking");
