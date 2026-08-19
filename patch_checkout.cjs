const fs = require('fs');
let code = fs.readFileSync('src/components/CartSidebar.tsx', 'utf-8');
code = code.replace(
`  const [momoOperator, setMomoOperator] = useState<'mtn' | 'airtel' | 'zamtel'>('mtn');
  const [momoPhone, setMomoPhone] = useState<string | null>(null);`,
`  const [momoOperator, setMomoOperator] = useState<'mtn' | 'airtel' | 'zamtel'>('mtn');
  const [momoPhone, setMomoPhone] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });`);
fs.writeFileSync('src/components/CartSidebar.tsx', code);
