const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

code += `
export interface Order {
  id: string;
  created_at: string;
  product_name: string;
  quantity: number;
  total_price: number;
  status: string;
  customer_name: string;
  customer_email: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  delivery_phone: string;
  delivery_country: string;
}

export interface Visit {
  id: string;
  created_at: string;
  page_path: string;
  visitor_id: string;
}
`;

fs.writeFileSync('src/types.ts', code);
console.log("Patched types.ts");
