// CÓDIGO COMPLETO DEL PASO 2 - PRODUCTO INDIVIDUAL
// Este código reemplaza la sección desde la línea 4783 hasta la línea 4877 aproximadamente
// En ClientesGerente.tsx

              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">📦 Artículos de Stock disponibles</h4>
                        <p className="text-sm text-blue-700">
                          Estos son artículos de compra que aún no están en tu catálogo de venta. 
                          Selecciona uno para agregarlo como producto vendible.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Box className="w-5 h-5 text-teal-600" />
                    Selecciona un Artículo de Stock
                  </h3>
                  
                  {/* Barra de búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar artículo por nombre, categoría, proveedor..."
                      value={busquedaArticulo}
                      onChange={(e) => setBusquedaArticulo(e.target.value)}
                      className="pl-10 h-12 border-2 border-gray-300 focus:border-teal-500"
                    />
                  </div>

                  {/* Lista de artículos de stock filtrados - Excluir los que ya están en el catálogo */}
                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                    {articulosStock
                      .filter(art => {
                        // Filtrar artículos que NO están en el catálogo de productos
                        const yaEnCatalogo = productosPanaderia.some(prod => prod.id === art.id);
                        if (yaEnCatalogo) return false;
                        
                        // Aplicar búsqueda
                        if (busquedaArticulo === '') return true;
                        const busqueda = busquedaArticulo.toLowerCase();
                        return (
                          art.nombre.toLowerCase().includes(busqueda) ||
                          art.categoria.toLowerCase().includes(busqueda) ||
                          art.proveedor.toLowerCase().includes(busqueda)
                        );
                      })
                      .map((art) => (
                        <Card 
                          key={art.id}
                          className={`cursor-pointer transition-all ${
                            articuloBaseSeleccionado?.id === art.id
                              ? 'border-teal-500 bg-teal-50 shadow-md'
                              : 'hover:border-teal-300'
                          }`}
                          onClick={() => {
                            setArticuloBaseSeleccionado(art);
                            setNombreProducto(art.nombre);
                            setPrecioCoste(art.precioCoste);
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                articuloBaseSeleccionado?.id === art.id ? 'bg-teal-500' : 'bg-gray-200'
                              }`}>
                                <ShoppingCart className={`w-6 h-6 ${
                                  articuloBaseSeleccionado?.id === art.id ? 'text-white' : 'text-gray-400'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{art.nombre}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{art.categoria}</p>
                                <div className="flex flex-col gap-1 mt-1.5">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs bg-white">{art.proveedor}</Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Coste:</span>
                                    <span className="text-sm font-semibold text-orange-600">{art.precioCoste.toFixed(2)}€</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">PVP sugerido:</span>
                                    <span className="text-xs font-semibold text-teal-600">{art.precioVentaSugerido.toFixed(2)}€</span>
                                  </div>
                                  {art.cantidadPorUnidad && (
                                    <span className="text-xs text-gray-500">{art.cantidadPorUnidad}</span>
                                  )}
                                </div>
                              </div>
                              {articuloBaseSeleccionado?.id === art.id && (
                                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {/* Mensaje si no hay artículos disponibles */}
                  {articulosStock.filter(art => {
                    const yaEnCatalogo = productosPanaderia.some(prod => prod.id === art.id);
                    return !yaEnCatalogo;
                  }).length === 0 && (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No hay artículos de stock disponibles</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Todos los artículos ya están en tu catálogo de productos
                      </p>
                    </div>
                  )}

                  {/* Artículo seleccionado */}
                  {articuloBaseSeleccionado && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-teal-50 to-white rounded-lg border-2 border-teal-300 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-teal-900 mb-2">✅ Artículo de Stock Seleccionado</p>
                          <p className="text-xl font-bold text-teal-700 mb-3">{articuloBaseSeleccionado.nombre}</p>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-teal-200">
                              <p className="text-xs text-gray-600 mb-1">Categoría</p>
                              <Badge className="bg-teal-600">{articuloBaseSeleccionado.categoria}</Badge>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-teal-200">
                              <p className="text-xs text-gray-600 mb-1">Proveedor</p>
                              <p className="text-sm font-medium text-gray-900">{articuloBaseSeleccionado.proveedor}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-orange-200">
                              <p className="text-xs text-gray-600 mb-1">💰 Precio de Coste</p>
                              <p className="text-lg font-bold text-orange-600">{articuloBaseSeleccionado.precioCoste.toFixed(2)}€</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-teal-200">
                              <p className="text-xs text-gray-600 mb-1">💡 PVP Sugerido</p>
                              <p className="text-lg font-bold text-teal-600">{articuloBaseSeleccionado.precioVentaSugerido.toFixed(2)}€</p>
                            </div>
                            {articuloBaseSeleccionado.cantidadPorUnidad && (
                              <div className="bg-white p-3 rounded-lg border border-gray-200 col-span-2">
                                <p className="text-xs text-gray-600 mb-1">Unidad de venta</p>
                                <p className="text-sm font-medium text-gray-900">{articuloBaseSeleccionado.cantidadPorUnidad}</p>
                              </div>
                            )}
                            <div className="bg-white p-3 rounded-lg border border-green-200 col-span-2">
                              <p className="text-xs text-gray-600 mb-1">📊 Margen estimado</p>
                              <p className="text-lg font-bold text-green-600">{articuloBaseSeleccionado.margen.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setArticuloBaseSeleccionado(null);
                            setNombreProducto('');
                            setPrecioCoste(0);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
