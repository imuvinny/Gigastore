const fs = require('fs');

let content = fs.readFileSync('src/components/CustomerAuthModal.tsx', 'utf8');

// Add Eye, EyeOff to imports
content = content.replace(
  "import { X, ArrowRight, Check, MailCheck, UserCheck } from 'lucide-react';",
  "import { X, ArrowRight, Check, MailCheck, UserCheck, Eye, EyeOff } from 'lucide-react';"
);

// Add showPassword state
content = content.replace(
  "const [isLoading, setIsLoading] = useState(false);",
  "const [isLoading, setIsLoading] = useState(false);\n  const [showPassword, setShowPassword] = useState(false);"
);

// Replace User already exists logic
const oldLogic = `      if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError("User already exists");
          setIsLoading(false);
          return;
      }`;
const newLogic = `      if (data.user && data.user.identities && data.user.identities.length === 0) {
          const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
          if (existingUser) {
              setError("User already exists");
              setIsLoading(false);
              return;
          } else {
              const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({ email, password });
              if (signInError) {
                  setError("Account exists. Please sign in or use 'Forgot Password'.");
                  setIsLoading(false);
                  return;
              }
              if (signInData.user) {
                  await supabase.from('users').upsert({
                      id: signInData.user.id,
                      email: email,
                      first_name: firstName,
                      last_name: lastName,
                      phone_number: phone
                  });
                  onSuccess();
                  return;
              }
          }
      }`;
content = content.replace(oldLogic, newLogic);

// Add Eye to Sign In Password
const oldSignInPassword = `        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            placeholder="Password"
            required
          />
        </div>`;
const newSignInPassword = `        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all pr-12"
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>`;
content = content.replace(oldSignInPassword, newSignInPassword);

// Add Eye to Sign Up Password
const oldSignUpPassword = `        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
          placeholder="Password"
          required
          minLength={6}
        />`;
const newSignUpPassword = `        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all pr-12"
            placeholder="Password"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>`;
content = content.replace(oldSignUpPassword, newSignUpPassword);

fs.writeFileSync('src/components/CustomerAuthModal.tsx', content);
