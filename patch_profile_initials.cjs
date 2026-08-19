const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileSidebar.tsx', 'utf-8');

const targetEffect = `  useEffect(() => {
    async function getUser() {
      if (!supabase) return;
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentUser = authUser || user;
      if (currentUser) {
        setUserAuth(currentUser);
        setUserEmail(currentUser.email || '');
        const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        if (data) {
           const { data: orders } = await supabase.from('orders').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(5);
           if (orders) setRecentOrders(orders);
           
           setProfile(data);
           setUserName(data.first_name ? \`\${data.first_name} \${data.last_name}\` : 'My Profile');
        } else {
           setUserName(currentUser.user_metadata?.first_name ? \`\${currentUser.user_metadata.first_name} \${currentUser.user_metadata.last_name}\` : 'My Profile');
        }
      } else {
        setUserAuth(null);
        setUserEmail('');
        setUserName('Guest Account');
      }
    }
    getUser();
  }, [user]);`;

const newEffect = `  useEffect(() => {
    async function getUser() {
      if (!supabase) return;
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentUser = authUser || user;
      if (currentUser) {
        setUserAuth(currentUser);
        setUserEmail(currentUser.email || '');
        
        const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || (currentUser.user_metadata?.first_name ? \`\${currentUser.user_metadata.first_name} \${currentUser.user_metadata.last_name}\` : '');
        
        const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        if (data) {
           const { data: orders } = await supabase.from('orders').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(5);
           if (orders) setRecentOrders(orders);
           
           setProfile(data);
           setUserName((data.first_name && data.last_name) ? \`\${data.first_name} \${data.last_name}\` : (metaName || 'My Profile'));
        } else {
           setUserName(metaName || 'My Profile');
        }
      } else {
        setUserAuth(null);
        setUserEmail('');
        setUserName('Guest Account');
      }
    }
    getUser();
  }, [user]);`;

code = code.replace(targetEffect, newEffect);

const targetInitials = `  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return \`\${profile.first_name[0]}\${profile.last_name[0]}\`.toUpperCase();
    }
    if (userAuth?.user_metadata?.first_name && userAuth?.user_metadata?.last_name) {
      return \`\${userAuth.user_metadata.first_name[0]}\${userAuth.user_metadata.last_name[0]}\`.toUpperCase();
    }
    return '';
  };`;

const newInitials = `  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return \`\${profile.first_name[0]}\${profile.last_name[0]}\`.toUpperCase();
    }
    const metaName = userAuth?.user_metadata?.full_name || userAuth?.user_metadata?.name;
    if (metaName) {
      const parts = metaName.split(' ').filter(Boolean);
      if (parts.length > 1) {
        return \`\${parts[0][0]}\${parts[parts.length-1][0]}\`.toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    if (userAuth?.user_metadata?.first_name && userAuth?.user_metadata?.last_name) {
      return \`\${userAuth.user_metadata.first_name[0]}\${userAuth.user_metadata.last_name[0]}\`.toUpperCase();
    }
    return 'U';
  };`;

code = code.replace(targetInitials, newInitials);
fs.writeFileSync('src/components/ProfileSidebar.tsx', code);
