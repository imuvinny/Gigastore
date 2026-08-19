const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetInitials = `  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return \`\${profile.first_name[0]}\${profile.last_name[0]}\`.toUpperCase();
    }
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return \`\${user.user_metadata.first_name[0]}\${user.user_metadata.last_name[0]}\`.toUpperCase();
    }
    return '';
  };`;

const newInitials = `  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return \`\${profile.first_name[0]}\${profile.last_name[0]}\`.toUpperCase();
    }
    const metaName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (metaName) {
      const parts = metaName.split(' ').filter(Boolean);
      if (parts.length > 1) {
        return \`\${parts[0][0]}\${parts[parts.length-1][0]}\`.toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return \`\${user.user_metadata.first_name[0]}\${user.user_metadata.last_name[0]}\`.toUpperCase();
    }
    return 'U';
  };`;

code = code.replace(targetInitials, newInitials);
fs.writeFileSync('src/App.tsx', code);
