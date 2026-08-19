import * as dotenv from 'dotenv';
// Load environment variables from .env
dotenv.config();

async function syncProducts() {
  console.log('Triggering sync on server...');
    
  try {
    const response = await fetch('http://localhost:3000/api/sync', { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Failed to sync: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`\nSync complete! Added ${data.addedCount}, Updated ${data.updatedCount}, Deleted ${data.deletedCount} products.`);
      
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

syncProducts();
