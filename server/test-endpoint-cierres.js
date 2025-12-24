// Test del endpoint de cierres de caja
async function testCierresEndpoint() {
  try {
    console.log('🔍 Probando endpoint /gerente/finanzas/cierres-caja...');
    
    const response = await fetch('http://localhost:4000/gerente/finanzas/cierres-caja', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status de respuesta:', response.status);
    console.log('📊 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos obtenidos exitosamente:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error en la respuesta:', response.status, errorText);
    }

  } catch (error) {
    console.error('❌ Error haciendo fetch:', error);
  }
}

testCierresEndpoint();