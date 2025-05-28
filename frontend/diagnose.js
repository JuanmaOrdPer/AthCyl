const axios = require('axios').default;
async function test() {
    try {
        console.log('🔍 Probando backend...');
        await axios.get('http://192.168.1.137:8000/admin/', {timeout: 3000});
        console.log('✅ Backend accesible');
        console.log('🎉 Frontend listo para conectarse');
    } catch (e) {
        console.log(`❌ Error: ${e.code || e.message}`);
        console.log('💡 Verificar que el backend esté ejecutándose');
    }
}
test();
