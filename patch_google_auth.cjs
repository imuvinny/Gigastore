const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerAuthModal.tsx', 'utf-8');

const targetMethod = `  const handleSignUp = async (e: React.FormEvent) => {`;
const newMethod = `  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (signInError) throw signInError;
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {`;

code = code.replace(targetMethod, newMethod);

const targetButton = `        <button
          type="button"
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-black font-medium py-4 rounded-2xl transition-colors flex items-center justify-center gap-3 relative"
        >`;
const newButton = `        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-black font-medium py-4 rounded-2xl transition-colors flex items-center justify-center gap-3 relative disabled:opacity-50"
        >`;
code = code.replace(targetButton, newButton);

fs.writeFileSync('src/components/CustomerAuthModal.tsx', code);
