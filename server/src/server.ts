import dotenv from "dotenv";
dotenv.config(); // <--- CARGA EL .ENV

import app from "./app";
import prisma from './prisma/client';

const PORT = process.env.PORT || 4000;

// Capturar errores no manejados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
  console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
});

// Mantener el proceso vivo
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`);
    process.exit(1);
  } else {
    console.error('❌ Error del servidor:', error);
    process.exit(1);
  }
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recibido, cerrando servidor...');
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      console.log('✅ Servidor cerrado');
      process.exit(0);
    }
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT recibido (Ctrl+C), cerrando servidor...');
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      console.log('✅ Servidor cerrado');
      process.exit(0);
    }
  });
});

