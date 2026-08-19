const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add NotFound404 import
code = code.replace(
  "import { NetworkStatus } from './components/NetworkStatus';",
  "import { NetworkStatus } from './components/NetworkStatus';\nimport { NotFound404 } from './components/NotFound404';"
);

// 2. Add XIcon
const xIconDef = `
const XIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
`;
code = code.replace(
  "const SlideImage = ({ src }: { src: string }) => {",
  xIconDef + "\nconst SlideImage = ({ src }: { src: string }) => {"
);

// 3. Add states
code = code.replace(
  "const [activeSlide, setActiveSlide] = useState(0);",
  "const [activeSlide, setActiveSlide] = useState(0);\n  const [socialLinks, setSocialLinks] = useState({ instagram: '', x: '', facebook: '' });\n  const [show404, setShow404] = useState(false);"
);

// 4. Load settings in fetchData
const loadSettingsCode = `
        const { data: dbSettings, error: errSettings } = await supabase.from('settings').select('*').eq('key', 'social_links').single();
        if (dbSettings && dbSettings.value) {
          setSocialLinks(dbSettings.value);
        } else if (errSettings) {
          console.warn("Settings table notice:", errSettings.message || errSettings);
        }
`;
code = code.replace(
  "setIsLoading(false); return; }\n      \n      try {",
  "setIsLoading(false); return; }\n      \n      try {" + loadSettingsCode
);

// 5. Pass to AdminPanel
code = code.replace(
  "setSlides={setSlidesList}",
  "setSlides={setSlidesList}\n            socialLinks={socialLinks}\n            setSocialLinks={setSocialLinks}"
);

// 6. Handle social click function
const socialClickFunc = `
  const handleSocialClick = (url: string) => {
    if (url && url.trim() !== '') {
      window.open(url, '_blank');
    } else {
      setShow404(true);
    }
  };
`;
code = code.replace(
  "const [bestSellersCounts, setBestSellersCounts] = useState<Record<string, number>>({});",
  socialClickFunc + "\n  const [bestSellersCounts, setBestSellersCounts] = useState<Record<string, number>>({});"
);

// 7. Update footer buttons
code = code.replace(
  '<button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"><Instagram size={18} /></button>',
  '<button onClick={() => handleSocialClick(socialLinks.instagram)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"><Instagram size={18} /></button>'
);
code = code.replace(
  '<button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"><Twitter size={18} /></button>',
  '<button onClick={() => handleSocialClick(socialLinks.x)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"><XIcon size={16} /></button>'
);
code = code.replace(
  '<button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"><Facebook size={18} /></button>',
  '<button onClick={() => handleSocialClick(socialLinks.facebook)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"><Facebook size={18} /></button>'
);

// 8. Render NotFound404
code = code.replace(
  "<NetworkStatus isLoading={isLoading} />",
  "<NetworkStatus isLoading={isLoading} />\n      {show404 && <NotFound404 onClose={() => setShow404(false)} />}"
);

fs.writeFileSync('src/App.tsx', code);
