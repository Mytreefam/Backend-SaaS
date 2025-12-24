/**
 * 📚 FORMACIÓN Y DOCUMENTACIÓN - VISTA COMPLETA
 * 
 * Componente unificado que incluye:
 * - Tab 1: Formación (módulos de onboarding y formación continua)
 * - Tab 2: Documentación (manuales, procedimientos, etc.)
 */

import { GraduationCap, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FormacionTrabajador } from './FormacionTrabajador';
import { DocumentacionTrabajador } from './DocumentacionTrabajador';

interface FormacionDocumentacionCompletoProps {
  trabajadorId: string;
  trabajadorNombre: string;
}

export function FormacionDocumentacionCompleto({
  trabajadorId,
  trabajadorNombre,
}: FormacionDocumentacionCompletoProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Formación y Documentación</h2>
        <p className="text-muted-foreground">
          Completa tu formación y consulta la documentación disponible
        </p>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="formacion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formacion" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Formación
          </TabsTrigger>
          <TabsTrigger value="documentacion" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentación
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: FORMACIÓN */}
        <TabsContent value="formacion" className="space-y-4">
          <FormacionTrabajador
            trabajadorId={trabajadorId}
            trabajadorNombre={trabajadorNombre}
          />
        </TabsContent>

        {/* TAB 2: DOCUMENTACIÓN */}
        <TabsContent value="documentacion" className="space-y-4">
          <DocumentacionTrabajador />
        </TabsContent>
      </Tabs>
    </div>
  );
}
