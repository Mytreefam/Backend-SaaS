import { DevicePreview } from '../components/DevicePreview';
import { TPV360Master, PermisosTPV } from '../components/TPV360Master';

export default function TPVPreview() {
  const permisosCompletos: PermisosTPV = {
    cobrar_pedidos: true,
    marcar_como_listo: true,
    gestionar_caja_rapida: true,
    hacer_retiradas: true,
    arqueo_caja: true,
    cierre_caja: true,
    ver_informes_turno: true,
    acceso_operativa: true,
    reimprimir_tickets: true,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-[2000px] mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            🔍 Previsualizador de TPV
          </h1>
          <p className="text-gray-600 text-sm">
            Visualiza cómo se ve el TPV en diferentes dispositivos simultáneamente.
            Haz clic en "Vista Completa" para una mejor visualización.
          </p>
        </div>

        <DevicePreview title="TPV360Master - Vista Principal">
          <TPV360Master
            permisos={permisosCompletos}
            nombreUsuario="Usuario Demo"
            rolUsuario="Gerente"
            puntoVentaId="SEDE-CENTRO"
            tpvId="TPV-001"
            marcaActiva="Panadería Artesanal"
            marcasDisponibles={['Panadería Artesanal', 'Cafetería Express']}
          />
        </DevicePreview>
      </div>
    </div>
  );
}
