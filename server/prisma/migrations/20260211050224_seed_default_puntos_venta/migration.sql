-- Seed default Puntos de Venta (idempotent)
INSERT INTO "PuntoVenta" ("id", "nombre", "direccion", "latitud", "longitud", "marcasIds", "activo", "modificadoEn")
VALUES
  (
    'PDV-TIANA',
    'Tiana',
    'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona',
    41.4933,
    2.2633,
    ARRAY['MRC-001','MRC-002'],
    true,
    NOW()
  ),
  (
    'PDV-BADALONA',
    'Badalona',
    'Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona',
    41.45,
    2.2461,
    ARRAY['MRC-001','MRC-002'],
    true,
    NOW()
  )
ON CONFLICT ("id") DO NOTHING;