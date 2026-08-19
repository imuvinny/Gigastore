const fs = require('fs');
let code = fs.readFileSync('src/components/CartSidebar.tsx', 'utf-8');

const replacement = `          } catch (mErr) {
            console.error("Lenco Pay network error:", mErr);
            setCheckoutState('failure');
            return;
          }
        } else if (paymentMethod === 'card') {
          const orderRef = insertedOrders?.[0]?.id || \`ORD_\${Date.now()}\`;
          const [expiryMonth, expiryYear] = cardDetails.expiry.split('/').map(s => s.trim());
          try {
            const lencoRes = await fetch('/api/payments/lenco/card', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: totalZMW,
                reference: String(orderRef),
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                card: {
                  number: cardDetails.number.replace(/\\s/g, ''),
                  cvv: cardDetails.cvv,
                  expiryMonth: expiryMonth || '',
                  expiryYear: expiryYear || ''
                }
              })
            });
            const lencoData = await lencoRes.json();
            if (lencoData.success) {
               // Check if there is a 3DS redirect
               if (lencoData.data?.authorization?.redirect) {
                 window.location.href = lencoData.data.authorization.redirect;
                 return;
               }
               
               // Poll for status like mobile money just in case
               setCheckoutState('awaiting_prompt');
               let attempts = 0;
               let paymentSuccessful = false;
               let paymentFailed = false;

               while (attempts < 30) {
                 await new Promise(r => setTimeout(r, 3000));
                 const statusRes = await fetch(\`/api/payments/lenco/status/\${String(orderRef)}\`);
                 const statusData = await statusRes.json();
                 if (statusData.success) {
                   if (statusData.data?.status === 'successful') {
                     paymentSuccessful = true;
                     break;
                   } else if (statusData.data?.status === 'failed') {
                     paymentFailed = true;
                     break;
                   }
                 }
                 attempts++;
               }
               if (paymentSuccessful) {
                 setCheckoutState('success');
                 onClearCart();
               } else {
                 setCheckoutState('failure');
               }
               return;
            } else {
              console.warn("Lenco API Notice:", lencoData.error || "Payment prompt pending configuration");
              if (lencoData.error) {
                alert(\`Card Payment Notice:\\n\${lencoData.error}\`);
              }
              setCheckoutState('failure');
              return;
            }
          } catch (mErr) {
            console.error("Lenco Pay network error:", mErr);
            setCheckoutState('failure');
            return;
          }
        }

        setCheckoutState('success');
        onClearCart();`;

code = code.replace(
`          } catch (mErr) {
            console.error("Lenco Pay network error:", mErr);
            setCheckoutState('failure');
            return;
          }
        }

        setCheckoutState('success');
        onClearCart();`, replacement);
fs.writeFileSync('src/components/CartSidebar.tsx', code);
