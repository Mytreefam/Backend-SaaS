/**
 * SERVICIO VERIFACTU
 * Implementación completa del sistema VeriFactu de la AEAT
 * Incluye: generación de hash, firma, QR, XML y envío a AEAT
 */

import CryptoJS from 'crypto-js';
import QRCode from 'qrcode';
import {
  FacturaVeriFactu,
  DatosVeriFactu,
  ConfiguracionVeriFactu,
  ResultadoVeriFactu,
  EstadoVeriFactu,
  RespuestaAEAT,
  LogVeriFactu,
  EstadisticasVeriFactu,
  TipoHash,
  AlgoritmoFirma,
} from '../types/verifactu.types';

// ============================================
// CONFIGURACIÓN POR DEFECTO
// ============================================

const CONFIGURACION_DEFAULT: ConfiguracionVeriFactu = {
  nifEmpresa: 'B12345678',
  nombreSistemaInformatico: 'Udar Edge',
  versionSistema: '1.0.0',
  algoritmoHash: 'SHA-256',
  urlBase: 'https://verifactu.agenciatributaria.gob.es/verifactu',
  seriesPorDefecto: {
    normal: '2025',
    simplificada: 'S2025',
    rectificativa: 'R2025',
  },
  modoProduccion: false, // IMPORTANTE: false para desarrollo
};

// ============================================
// CLASE PRINCIPAL DEL SERVICIO
// ============================================

class VeriFactuService {
  private configuracion: ConfiguracionVeriFactu;
  private logs: LogVeriFactu[] = [];
  private estadisticas: EstadisticasVeriFactu = {
    totalFacturas: 0,
    facturasFirmadas: 0,
    facturasEnviadas: 0,
    facturasValidadas: 0,
    facturasRechazadas: 0,
  };

  constructor(configuracion?: Partial<ConfiguracionVeriFactu>) {
    this.configuracion = {
      ...CONFIGURACION_DEFAULT,
      ...configuracion,
    };
    this.cargarEstadisticas();
  }

  // ============================================
  // GENERAR VERIFACTU COMPLETO
  // ============================================

  /**
   * Genera todos los datos VeriFactu para una factura
   * @param factura - Factura a procesar
   * @returns Factura con datos VeriFactu
   */
  async generarVeriFactu(factura: FacturaVeriFactu): Promise<FacturaVeriFactu> {
    try {
      this.log('generar', factura.id, 'Iniciando generación VeriFactu');

      // 1. Generar ID único VeriFactu
      const idVeriFactu = this.generarIdVeriFactu(factura);

      // 2. Generar hash de la factura
      const hash = this.generarHash(factura);

      // 3. Obtener hash de la factura anterior (encadenamiento)
      const hashFacturaAnterior = this.configuracion.ultimoHash || null;

      // 4. Generar código QR
      const datosQR = await this.generarQR(factura, hash);

      // 5. Crear objeto VeriFactu
      const datosVeriFactu: DatosVeriFactu = {
        idVeriFactu,
        hash,
        algoritmoHash: this.configuracion.algoritmoHash,
        hashFacturaAnterior: hashFacturaAnterior || undefined,
        codigoQR: datosQR.qrBase64,
        urlQR: datosQR.url,
        fechaRegistro: new Date(),
        estado: 'firmada' as EstadoVeriFactu,
      };

      // 6. Firmar si hay certificado
      if (this.configuracion.certificado) {
        datosVeriFactu.firma = await this.firmarFactura(factura, hash);
        datosVeriFactu.algoritmoFirma = this.configuracion.algoritmoFirma;
      }

      // 7. Actualizar factura con datos VeriFactu
      const facturaConVeriFactu: FacturaVeriFactu = {
        ...factura,
        verifactu: datosVeriFactu,
      };

      // 8. Actualizar configuración con último hash
      this.configuracion.ultimoHash = hash;
      this.guardarConfiguracion();

      // 9. Actualizar estadísticas
      this.estadisticas.totalFacturas++;
      this.estadisticas.facturasFirmadas++;
      this.estadisticas.ultimaFactura = factura.id;
      this.estadisticas.ultimoHash = hash;
      this.estadisticas.fechaUltimaFactura = new Date();
      this.guardarEstadisticas();

      this.log('generar', factura.id, 'VeriFactu generado exitosamente', 'exito');

      return facturaConVeriFactu;
    } catch (error) {
      this.log('error', factura.id, `Error generando VeriFactu: ${error}`, 'error');
      throw error;
    }
  }

  // ============================================
  // GENERAR HASH
  // ============================================

  /**
   * Genera el hash de la factura según normativa VeriFactu
   * @param factura - Factura a hashear
   * @returns Hash en hexadecimal
   */
  private generarHash(factura: FacturaVeriFactu): string {
    // Crear cadena de texto con los datos relevantes de la factura
    const cadenaParaHash = this.construirCadenaHash(factura);

    // Generar hash según el algoritmo configurado
    let hash: string;
    switch (this.configuracion.algoritmoHash) {
      case 'SHA-256':
        hash = CryptoJS.SHA256(cadenaParaHash).toString(CryptoJS.enc.Hex);
        break;
      case 'SHA-384':
        hash = CryptoJS.SHA384(cadenaParaHash).toString(CryptoJS.enc.Hex);
        break;
      case 'SHA-512':
        hash = CryptoJS.SHA512(cadenaParaHash).toString(CryptoJS.enc.Hex);
        break;
      default:
        hash = CryptoJS.SHA256(cadenaParaHash).toString(CryptoJS.enc.Hex);
    }

    return hash.toUpperCase();
  }

  /**
   * Construye la cadena de texto para generar el hash
   * Según especificaciones VeriFactu de la AEAT
   */
  private construirCadenaHash(factura: FacturaVeriFactu): string {
    const partes: string[] = [
      // NIF del emisor
      factura.emisor.nif,
      
      // Número completo de factura
      factura.numeroCompleto,
      
      // Fecha y hora de expedición
      this.formatearFechaISO(factura.fechaExpedicion),
      factura.horaExpedicion,
      
      // Tipo de factura
      factura.tipoFactura,
      
      // Base imponible
      this.formatearImporte(factura.baseImponibleTotal),
      
      // Cuota IVA
      this.formatearImporte(factura.cuotaIVATotal),
      
      // Importe total
      this.formatearImporte(factura.importeTotal),
      
      // Hash de la factura anterior (si existe)
      this.configuracion.ultimoHash || '',
    ];

    return partes.join('|');
  }

  // ============================================
  // GENERAR ID VERIFACTU
  // ============================================

  /**
   * Genera un ID único para VeriFactu
   * Formato: NIF-AAAAMMDD-HHMMSS-SERIE-NUMERO
   */
  private generarIdVeriFactu(factura: FacturaVeriFactu): string {
    const fecha = new Date();
    const partes = [
      factura.emisor.nif,
      this.formatearFecha(fecha, 'AAAAMMDD'),
      this.formatearHora(fecha, 'HHMMSS'),
      factura.serie,
      factura.numero.padStart(6, '0'),
    ];
    return partes.join('-');
  }

  // ============================================
  // FIRMAR FACTURA
  // ============================================

  /**
   * Firma electrónicamente la factura
   * NOTA: Requiere certificado digital
   */
  private async firmarFactura(factura: FacturaVeriFactu, hash: string): Promise<string> {
    // IMPORTANTE: En producción real, aquí se usaría el certificado digital
    // Para desarrollo, generamos una firma simulada
    
    if (!this.configuracion.certificado) {
      throw new Error('No hay certificado digital configurado');
    }

    // Simular firma (en producción usar Web Crypto API o librerías de firma)
    const datosParaFirmar = `${hash}|${factura.numeroCompleto}|${factura.emisor.nif}`;
    const firmaSimulada = CryptoJS.HmacSHA256(
      datosParaFirmar,
      this.configuracion.certificado.password
    ).toString(CryptoJS.enc.Base64);

    return firmaSimulada;
  }

  // ============================================
  // GENERAR CÓDIGO QR
  // ============================================

  /**
   * Genera el código QR según especificaciones VeriFactu
   */
  private async generarQR(
    factura: FacturaVeriFactu,
    hash: string
  ): Promise<{ qrBase64: string; url: string }> {
    // Construir URL de verificación según normativa AEAT
    const parametros = new URLSearchParams({
      nif: factura.emisor.nif,
      num: factura.numeroCompleto,
      fecha: this.formatearFechaISO(factura.fechaExpedicion),
      importe: this.formatearImporte(factura.importeTotal),
      hash: hash.substring(0, 16), // Primeros 16 caracteres del hash
    });

    const url = `${this.configuracion.urlBase}?${parametros.toString()}`;

    // Generar QR como imagen PNG en base64
    const qrBase64 = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    });

    return { qrBase64, url };
  }

  // ============================================
  // ENVIAR A AEAT
  // ============================================

  /**
   * Envía la factura a la AEAT
   * NOTA: En producción requiere conexión real con la AEAT
   */
  async enviarAEAT(factura: FacturaVeriFactu): Promise<ResultadoVeriFactu> {
    try {
      if (!factura.verifactu) {
        throw new Error('La factura no tiene datos VeriFactu');
      }

      this.log('enviar', factura.id, 'Enviando factura a AEAT');

      // Generar XML según normativa
      const xml = this.generarXML(factura);

      // IMPORTANTE: En producción, aquí se haría la petición HTTP real a la AEAT
      // Por ahora simulamos una respuesta
      const respuestaSimulada = await this.simularEnvioAEAT(factura, xml);

      // Actualizar factura con respuesta
      if (factura.verifactu) {
        factura.verifactu.estado = respuestaSimulada.aceptada ? 'validada' : 'rechazada';
        factura.verifactu.fechaEnvio = new Date();
        factura.verifactu.respuestaAEAT = respuestaSimulada;
        factura.verifactu.csvEnvio = respuestaSimulada.csv;
      }

      // Actualizar estadísticas
      this.estadisticas.facturasEnviadas++;
      if (respuestaSimulada.aceptada) {
        this.estadisticas.facturasValidadas++;
      } else {
        this.estadisticas.facturasRechazadas++;
      }
      this.guardarEstadisticas();

      this.log(
        'enviar',
        factura.id,
        `Factura ${respuestaSimulada.aceptada ? 'aceptada' : 'rechazada'} por AEAT`,
        respuestaSimulada.aceptada ? 'exito' : 'error'
      );

      return {
        exito: respuestaSimulada.aceptada,
        mensaje: respuestaSimulada.descripcion,
        datos: respuestaSimulada,
      };
    } catch (error) {
      this.log('error', factura.id, `Error enviando a AEAT: ${error}`, 'error');
      return {
        exito: false,
        mensaje: `Error al enviar: ${error}`,
        errores: [String(error)],
      };
    }
  }

  /**
   * Simula el envío a AEAT (para desarrollo)
   */
  private async simularEnvioAEAT(
    factura: FacturaVeriFactu,
    xml: string
  ): Promise<RespuestaAEAT> {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simular validación básica
    const errores = this.validarFactura(factura);
    const aceptada = errores.length === 0;

    return {
      codigo: aceptada ? '0000' : '1001',
      descripcion: aceptada
        ? 'Factura registrada correctamente'
        : 'La factura contiene errores',
      aceptada,
      errores: errores.length > 0 ? errores : undefined,
      csv: aceptada ? this.generarCSV() : undefined,
      fechaProceso: new Date(),
    };
  }

  // ============================================
  // GENERAR XML
  // ============================================

  /**
   * Genera el XML de la factura según normativa VeriFactu/FacturaE
   */
  private generarXML(factura: FacturaVeriFactu): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FacturaElectronica xmlns="http://www.facturae.gob.es/formato/Versiones/Facturaev3_2_2.xml">
  <FileHeader>
    <SchemaVersion>3.2.2</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
    <Batch>
      <BatchIdentifier>${factura.serie}</BatchIdentifier>
      <InvoicesCount>1</InvoicesCount>
      <TotalInvoicesAmount>
        <TotalAmount>${this.formatearImporte(factura.importeTotal)}</TotalAmount>
      </TotalInvoicesAmount>
      <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
    </Batch>
  </FileHeader>
  
  <Parties>
    <SellerParty>
      <TaxIdentification>
        <PersonTypeCode>J</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${factura.emisor.nif}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${this.escaparXML(factura.emisor.razonSocial)}</CorporateName>
        <AddressInSpain>
          <Address>${this.escaparXML(factura.emisor.direccion.nombreVia)}</Address>
          <PostCode>${factura.emisor.direccion.codigoPostal}</PostCode>
          <Town>${this.escaparXML(factura.emisor.direccion.municipio)}</Town>
          <Province>${this.escaparXML(factura.emisor.direccion.provincia)}</Province>
          <CountryCode>${factura.emisor.direccion.codigoPais}</CountryCode>
        </AddressInSpain>
      </LegalEntity>
    </SellerParty>
    
    ${this.generarXMLReceptor(factura)}
  </Parties>
  
  <Invoices>
    <Invoice>
      <InvoiceHeader>
        <InvoiceNumber>${factura.numeroCompleto}</InvoiceNumber>
        <InvoiceSeriesCode>${factura.serie}</InvoiceSeriesCode>
        <InvoiceDocumentType>${factura.tipoFactura}</InvoiceDocumentType>
        <InvoiceClass>OO</InvoiceClass>
      </InvoiceHeader>
      
      <InvoiceIssueData>
        <IssueDate>${this.formatearFechaISO(factura.fechaExpedicion)}</IssueDate>
        <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
        <TaxCurrencyCode>EUR</TaxCurrencyCode>
        <LanguageName>es</LanguageName>
      </InvoiceIssueData>
      
      <TaxesOutputs>
        ${this.generarXMLImpuestos(factura)}
      </TaxesOutputs>
      
      <InvoiceTotals>
        <TotalGrossAmount>${this.formatearImporte(factura.baseImponibleTotal)}</TotalGrossAmount>
        <TotalTaxOutputs>${this.formatearImporte(factura.cuotaIVATotal)}</TotalTaxOutputs>
        <InvoiceTotal>${this.formatearImporte(factura.importeTotal)}</InvoiceTotal>
      </InvoiceTotals>
      
      <Items>
        ${this.generarXMLLineas(factura)}
      </Items>
      
      ${this.generarXMLVeriFactu(factura)}
    </Invoice>
  </Invoices>
  
  <Extensions>
    <VeriFactu>
      <Hash>${factura.verifactu?.hash}</Hash>
      <HashAlgorithm>${factura.verifactu?.algoritmoHash}</HashAlgorithm>
      ${factura.verifactu?.hashFacturaAnterior ? `<PreviousHash>${factura.verifactu.hashFacturaAnterior}</PreviousHash>` : ''}
      ${factura.verifactu?.firma ? `<Signature>${factura.verifactu.firma}</Signature>` : ''}
    </VeriFactu>
  </Extensions>
</FacturaElectronica>`;

    return xml;
  }

  private generarXMLReceptor(factura: FacturaVeriFactu): string {
    if (!factura.receptor || factura.facturaSinDestinatario) {
      return '<BuyerParty></BuyerParty>';
    }

    return `<BuyerParty>
      <TaxIdentification>
        <PersonTypeCode>J</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${factura.receptor.numeroIdentificador || 'CONSUMIDOR'}</TaxIdentificationNumber>
      </TaxIdentification>
      ${factura.receptor.razonSocial ? `<LegalEntity><CorporateName>${this.escaparXML(factura.receptor.razonSocial)}</CorporateName></LegalEntity>` : ''}
    </BuyerParty>`;
  }

  private generarXMLImpuestos(factura: FacturaVeriFactu): string {
    return factura.desgloseIVA
      .map(
        (desglose) => `
        <Tax>
          <TaxTypeCode>01</TaxTypeCode>
          <TaxRate>${this.formatearImporte(desglose.tipoIVA)}</TaxRate>
          <TaxableBase>
            <TotalAmount>${this.formatearImporte(desglose.baseImponible)}</TotalAmount>
          </TaxableBase>
          <TaxAmount>
            <TotalAmount>${this.formatearImporte(desglose.cuotaIVA)}</TotalAmount>
          </TaxAmount>
        </Tax>`
      )
      .join('');
  }

  private generarXMLLineas(factura: FacturaVeriFactu): string {
    return factura.lineas
      .map(
        (linea) => `
        <InvoiceLine>
          <ItemDescription>${this.escaparXML(linea.descripcion)}</ItemDescription>
          <Quantity>${linea.cantidad}</Quantity>
          <UnitOfMeasure>${linea.unidad}</UnitOfMeasure>
          <UnitPriceWithoutTax>${this.formatearImporte(linea.precioUnitario)}</UnitPriceWithoutTax>
          <TotalCost>${this.formatearImporte(linea.baseImponible)}</TotalCost>
          <GrossAmount>${this.formatearImporte(linea.baseImponible)}</GrossAmount>
        </InvoiceLine>`
      )
      .join('');
  }

  private generarXMLVeriFactu(factura: FacturaVeriFactu): string {
    if (!factura.verifactu) return '';

    return `<AdditionalData>
      <VeriFactuID>${factura.verifactu.idVeriFactu}</VeriFactuID>
      <QRCodeURL>${factura.verifactu.urlQR}</QRCodeURL>
    </AdditionalData>`;
  }

  // ============================================
  // VALIDAR FACTURA
  // ============================================

  /**
   * Valida que la factura cumpla con los requisitos VeriFactu
   */
  private validarFactura(factura: FacturaVeriFactu): any[] {
    const errores: any[] = [];

    // Validar emisor
    if (!factura.emisor.nif || !this.validarNIF(factura.emisor.nif)) {
      errores.push({
        codigo: 'E001',
        descripcion: 'NIF del emisor inválido',
        campo: 'emisor.nif',
        gravedad: 'error' as const,
      });
    }

    // Validar importes
    if (factura.importeTotal <= 0) {
      errores.push({
        codigo: 'E002',
        descripcion: 'El importe total debe ser mayor que 0',
        campo: 'importeTotal',
        gravedad: 'error' as const,
      });
    }

    // Validar líneas
    if (factura.lineas.length === 0) {
      errores.push({
        codigo: 'E003',
        descripcion: 'La factura debe tener al menos una línea',
        campo: 'lineas',
        gravedad: 'error' as const,
      });
    }

    // Validar desglose IVA
    const sumaBasesIVA = factura.desgloseIVA.reduce(
      (sum, d) => sum + d.baseImponible,
      0
    );
    if (Math.abs(sumaBasesIVA - factura.baseImponibleTotal) > 0.01) {
      errores.push({
        codigo: 'E004',
        descripcion: 'El desglose de IVA no coincide con la base imponible total',
        campo: 'desgloseIVA',
        gravedad: 'error' as const,
      });
    }

    return errores;
  }

  // ============================================
  // UTILIDADES
  // ============================================

  private validarNIF(nif: string): boolean {
    // Validación simplificada de NIF/CIF español
    const regex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$|^\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    return regex.test(nif);
  }

  private formatearFecha(fecha: Date, formato: string): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    if (formato === 'AAAAMMDD') {
      return `${año}${mes}${dia}`;
    }
    return `${año}-${mes}-${dia}`;
  }

  private formatearFechaISO(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  private formatearHora(fecha: Date, formato: string): string {
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');

    if (formato === 'HHMMSS') {
      return `${horas}${minutos}${segundos}`;
    }
    return `${horas}:${minutos}:${segundos}`;
  }

  private formatearImporte(importe: number): string {
    return importe.toFixed(2);
  }

  private escaparXML(texto: string): string {
    return texto
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private generarCSV(): string {
    // Generar CSV simulado (Código Seguro de Verificación)
    const fecha = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `CSV${fecha}${random}`;
  }

  // ============================================
  // LOGS Y ESTADÍSTICAS
  // ============================================

  private log(
    accion: LogVeriFactu['accion'],
    facturaId: string,
    detalles: string,
    resultado: 'exito' | 'error' = 'exito'
  ): void {
    const log: LogVeriFactu = {
      id: `LOG-${Date.now()}`,
      fecha: new Date(),
      accion,
      facturaId,
      detalles,
      resultado,
    };
    this.logs.push(log);
    
    // Mantener solo los últimos 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
    
    // Guardar en localStorage
    this.guardarLogs();
  }

  private cargarEstadisticas(): void {
    const stored = localStorage.getItem('verifactu_estadisticas');
    if (stored) {
      this.estadisticas = JSON.parse(stored);
    }
  }

  private guardarEstadisticas(): void {
    localStorage.setItem('verifactu_estadisticas', JSON.stringify(this.estadisticas));
  }

  private guardarConfiguracion(): void {
    localStorage.setItem('verifactu_config', JSON.stringify(this.configuracion));
  }

  private guardarLogs(): void {
    localStorage.setItem('verifactu_logs', JSON.stringify(this.logs));
  }

  // ============================================
  // MÉTODOS PÚBLICOS DE CONSULTA
  // ============================================

  public obtenerEstadisticas(): EstadisticasVeriFactu {
    return { ...this.estadisticas };
  }

  public obtenerLogs(limite: number = 50): LogVeriFactu[] {
    return this.logs.slice(-limite);
  }

  public obtenerConfiguracion(): ConfiguracionVeriFactu {
    return { ...this.configuracion };
  }

  public actualizarConfiguracion(config: Partial<ConfiguracionVeriFactu>): void {
    this.configuracion = {
      ...this.configuracion,
      ...config,
    };
    this.guardarConfiguracion();
  }
}

// ============================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================

export const verifactuService = new VeriFactuService();
export default verifactuService;
