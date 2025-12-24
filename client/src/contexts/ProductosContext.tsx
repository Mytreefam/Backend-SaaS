/**
 * 🛍️ CONTEXTO DE PRODUCTOS Y CATEGORÍAS
 * Centraliza la gestión de productos y categorías para usar en TPV y Gestión de Productos
 * ✅ FASE 2: Sincronización de stock en tiempo real + BroadcastChannel
 * ✅ FASE 3: Integración con API backend
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { deliverySyncService, type ProductoDelivery } from '../services/delivery-sync.service';
import { stockReservationService } from '../services/stock-reservation.service';
import { productosApi } from '../services/api';
import { toast } from 'sonner@2.0.3';

// ============================================
// BROADCAST CHANNEL - Sincronización de stock
// ============================================

let stockChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  stockChannel = new BroadcastChannel('udar-stock-sync');
}

// ============================================
// TIPOS
// ============================================

interface OpcionPersonalizacion {
  id: string;
  nombre: string;
  precioAdicional?: number;
}

interface GrupoOpciones {
  id: string;
  titulo: string;
  descripcion?: string;
  obligatorio: boolean;
  minSeleccion?: number;
  maxSeleccion?: number;
  opciones: OpcionPersonalizacion[];
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  descripcion?: string;
  imagen?: string;
  marcas_ids?: string[];
  activo?: boolean;
  visible_tpv?: boolean;
  sku?: string;
  iva?: number;
  gruposOpciones?: GrupoOpciones[]; // 🎯 NUEVO: Para productos personalizables (combos, pizzas, etc.)
}

// ============================================
// CATEGORÍAS CENTRALIZADAS
// ============================================

// Categorías generales (se comparten entre marcas)
export const CATEGORIAS_PRODUCTOS = [
  'Combos',
  'Burgers',
  'Pizzas Premium',
  'Pizzas Clásicas',
  'Entrantes',
  'Postres',
  'Bebidas sin Alcohol',
  'Bebidas con Alcohol'
];

// ============================================
// PRODUCTOS MOCK INICIALES - BLACKBURGER
// ============================================

const PRODUCTOS_INICIALES: Producto[] = [
  // ==========================================
  // 🔵 1) COMBOS (2 productos)
  // ==========================================
  {
    id: 'combo-001',
    nombre: 'Combo 1',
    categoria: 'Combos',
    precio: 12.90,
    stock: 50,
    descripcion: 'Black Burger a elegir + patatas fritas + bebida + postre',
    imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    marcas_ids: ['MRC-002'], // BLACKBURGER
    activo: true,
    visible_tpv: true,
    sku: 'CMB-001',
    iva: 10,
    // 🍔 OPCIONES PERSONALIZABLES DEL COMBO
    gruposOpciones: [
      {
        id: 'burger',
        titulo: 'Elige tu Burger',
        descripcion: 'Selecciona 1 hamburguesa básica',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'burg-001', nombre: 'Burger Típica', precioAdicional: 0 },
          { id: 'burg-002', nombre: 'Burger Mexicana', precioAdicional: 0 },
          { id: 'burg-003', nombre: 'Burger Simple', precioAdicional: 0 },
          { id: 'burg-004', nombre: 'Burger Black BBQ', precioAdicional: 0 },
          { id: 'burg-005', nombre: 'Burger Crispy Chicken', precioAdicional: 0 },
        ]
      },
      {
        id: 'bebida',
        titulo: 'Elige tu Bebida',
        descripcion: 'Selecciona 1 bebida',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'coca', nombre: 'Coca-Cola', precioAdicional: 0 },
          { id: 'fanta', nombre: 'Fanta Naranja', precioAdicional: 0 },
          { id: 'sprite', nombre: 'Sprite', precioAdicional: 0 },
          { id: 'agua', nombre: 'Agua Mineral', precioAdicional: 0 },
        ]
      },
      {
        id: 'postre',
        titulo: 'Elige tu Postre',
        descripcion: 'Selecciona 1 postre',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'helado', nombre: 'Helado', precioAdicional: 0 },
          { id: 'brownie', nombre: 'Brownie', precioAdicional: 0 },
          { id: 'tarta', nombre: 'Tarta de queso', precioAdicional: 0 },
        ]
      }
    ]
  },
  {
    id: 'combo-002',
    nombre: 'Combo 2',
    categoria: 'Combos',
    precio: 13.90,
    stock: 50,
    descripcion: '2 Black Burgers a elegir + patatas fritas + 2 bebidas',
    imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    marcas_ids: ['MRC-002'], // BLACKBURGER
    activo: true,
    visible_tpv: true,
    sku: 'CMB-002',
    iva: 10,
    // 🍔 OPCIONES PERSONALIZABLES DEL COMBO 2
    gruposOpciones: [
      {
        id: 'burger',
        titulo: 'Elige tus Burgers',
        descripcion: 'Selecciona 2 hamburguesas básicas',
        obligatorio: true,
        minSeleccion: 2,
        maxSeleccion: 2,
        opciones: [
          { id: 'burg-001', nombre: 'Burger Típica', precioAdicional: 0 },
          { id: 'burg-002', nombre: 'Burger Mexicana', precioAdicional: 0 },
          { id: 'burg-003', nombre: 'Burger Simple', precioAdicional: 0 },
          { id: 'burg-004', nombre: 'Burger Black BBQ', precioAdicional: 0 },
          { id: 'burg-005', nombre: 'Burger Crispy Chicken', precioAdicional: 0 },
        ]
      },
      {
        id: 'bebida',
        titulo: 'Elige tus Bebidas',
        descripcion: 'Selecciona 2 bebidas',
        obligatorio: true,
        minSeleccion: 2,
        maxSeleccion: 2,
        opciones: [
          { id: 'coca', nombre: 'Coca-Cola', precioAdicional: 0 },
          { id: 'fanta', nombre: 'Fanta Naranja', precioAdicional: 0 },
          { id: 'sprite', nombre: 'Sprite', precioAdicional: 0 },
          { id: 'agua', nombre: 'Agua Mineral', precioAdicional: 0 },
        ]
      }
    ]
  },

  // ==========================================
  // 🟡 2) ENTRANTES (5 productos)
  // ==========================================
  {
    id: 'ent-001',
    nombre: 'Patatas Deluxe',
    categoria: 'Entrantes',
    precio: 4.20,
    stock: 100,
    descripcion: 'Patatas estilo deluxe sazonadas',
    imagen: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ENT-001',
    iva: 10
  },
  {
    id: 'ent-002',
    nombre: 'Patatas Delicia',
    categoria: 'Entrantes',
    precio: 4.20,
    stock: 80,
    descripcion: 'Patatas de boniato',
    imagen: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ENT-002',
    iva: 10
  },
  {
    id: 'ent-003',
    nombre: 'Patatas Supreme',
    categoria: 'Entrantes',
    precio: 4.95,
    stock: 60,
    descripcion: 'Patatas con salsa trufa y parmesano',
    imagen: 'https://images.unsplash.com/photo-1630431341973-02e1b662ec53?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ENT-003',
    iva: 10
  },
  {
    id: 'ent-004',
    nombre: 'Salchipapa Supreme',
    categoria: 'Entrantes',
    precio: 5.95,
    stock: 40,
    descripcion: 'Patatas, Frankfurt en tacos, queso cheddar',
    imagen: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ENT-004',
    iva: 10
  },
  {
    id: 'ent-005',
    nombre: 'Salchipapa',
    categoria: 'Entrantes',
    precio: 5.50,
    stock: 45,
    descripcion: 'Patatas fritas, Frankfurt, cebolla crujiente',
    imagen: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ENT-005',
    iva: 10
  },

  // ==========================================
  // 🔴 3) TOP BURGERS (5 productos premium)
  // ==========================================
  {
    id: 'top-001',
    nombre: 'Black Truffle Burger',
    categoria: 'Burgers',
    precio: 10.90,
    stock: 30,
    descripcion: 'Cheddar, bacon, salsa de trufa',
    imagen: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'TOP-001',
    iva: 10
  },
  {
    id: 'top-002',
    nombre: 'Doble Pollo Burger',
    categoria: 'Burgers',
    precio: 13.90,
    stock: 25,
    descripcion: 'Doble pollo crispy, bacon, huevo, cheddar',
    imagen: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'TOP-002',
    iva: 10
  },
  {
    id: 'top-003',
    nombre: 'Doble Black Burger',
    categoria: 'Burgers',
    precio: 13.90,
    stock: 25,
    descripcion: 'Doble ternera (150 g), cebolla crujiente, cheddar',
    imagen: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'TOP-003',
    iva: 10
  },
  {
    id: 'top-004',
    nombre: 'Doble Vegan Burger',
    categoria: 'Burgers',
    precio: 14.90,
    stock: 20,
    descripcion: 'Pollo vegano, cebolla caramelizada, queso vegano, lechuga, tomate',
    imagen: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'TOP-004',
    iva: 10
  },
  {
    id: 'top-005',
    nombre: 'Top Vegan Burger',
    categoria: 'Burgers',
    precio: 11.90,
    stock: 15,
    descripcion: 'Tofu, queso vegano, tomate, queso de cabra, rúcula',
    imagen: 'https://images.unsplash.com/photo-1585238341710-4a14e30906c1?w=400',
    marcas_ids: ['MRC-002'],
    activo: false, // ⚠️ Inactiva
    visible_tpv: false,
    sku: 'TOP-005',
    iva: 10
  },

  // ==========================================
  // 🟢 4) LAS BURGERS (11 burgers clásicas)
  // ==========================================
  {
    id: 'burg-001',
    nombre: 'Burger Típica',
    categoria: 'Burgers',
    precio: 9.90,
    stock: 40,
    descripcion: 'Ternera (150 g), cheddar, bacon, tomate, lechuga, cebolla crujiente',
    imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BRG-001',
    iva: 10
  },
  {
    id: 'burg-002',
    nombre: 'Burger Mexicana',
    categoria: 'Burgers',
    precio: 10.90,
    stock: 35,
    descripcion: 'Ternera, cheddar, tomate, aguacate, huevo, salsa picante',
    imagen: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BRG-002',
    iva: 10
  },
  {
    id: 'burg-003',
    nombre: 'Burger Simple',
    categoria: 'Burgers',
    precio: 10.90,
    stock: 30,
    descripcion: 'Ternera, cebolla caramelizada, queso de cabra',
    imagen: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BRG-003',
    iva: 10
  },
  {
    id: 'burg-004',
    nombre: 'Burger Black BBQ',
    categoria: 'Burgers',
    precio: 10.90,
    stock: 32,
    descripcion: 'Ternera, bacon crujiente, cebolla, salsa black BBQ',
    imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BRG-004',
    iva: 10
  },
  {
    id: 'burg-005',
    nombre: 'Burger Crispy Chicken',
    categoria: 'Burgers',
    precio: 10.90,
    stock: 28,
    descripcion: 'Pollo rebozado, cheddar, rúcula, cebolla, tomate, mayonesa',
    imagen: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BRG-005',
    iva: 10
  },
  {
    id: 'burg-006',
    nombre: 'Burger Vegana',
    categoria: 'Burgers',
    precio: 10.90,
    stock: 20,
    descripcion: 'Heura, queso vegano, tomate, rúcula',
    imagen: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BRG-006',
    iva: 10
  },
  {
    id: 'burg-007',
    nombre: 'CheeseBurgerr',
    categoria: 'Burgers',
    precio: 9.00,
    stock: 45,
    descripcion: 'Doble ternera, cebolla crujiente, cheddar',
    imagen: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BRG-007',
    iva: 10
  },
  {
    id: 'burg-008',
    nombre: 'Bacon Cheeseburgerr',
    categoria: 'Burgers',
    precio: 9.90,
    stock: 38,
    descripcion: 'Ternera, doble cheddar, bacon crujiente, salsa burger',
    imagen: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BRG-008',
    iva: 10
  },
  {
    id: 'burg-009',
    nombre: 'PulledPork Burger',
    categoria: 'Burgers',
    precio: 11.90,
    stock: 22,
    descripcion: 'Cerdo desmenuzado, bacon, BBQ, cebolla frita',
    imagen: 'https://images.unsplash.com/photo-1615297928064-24977384d0da?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BRG-009',
    iva: 10
  },
  {
    id: 'burg-010',
    nombre: 'Goodsex Burgerr',
    categoria: 'Burgers',
    precio: 10.90,
    stock: 30,
    descripcion: 'Smash, huevo, lechuga, pepinillo, salsa miel y mostaza',
    imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BRG-010',
    iva: 10
  },
  {
    id: 'burg-011',
    nombre: 'Burger Ibérica',
    categoria: 'Burgers',
    precio: 10.90,
    stock: 25,
    descripcion: 'Ternera, virutas ibéricas, huevo, cebolla',
    imagen: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BRG-011',
    iva: 10
  },

  // ==========================================
  // 🍰 5) POSTRES (4 productos)
  // ==========================================
  {
    id: 'post-001',
    nombre: 'Tiramisú',
    categoria: 'Postres',
    precio: 5.50,
    stock: 20,
    descripcion: 'Tiramisú italiano tradicional',
    imagen: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'PST-001',
    iva: 10
  },
  {
    id: 'post-002',
    nombre: 'Tiramisú Oreo',
    categoria: 'Postres',
    precio: 5.95,
    stock: 18,
    descripcion: 'Mascarpone con virutas Oreo',
    imagen: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'PST-002',
    iva: 10
  },
  {
    id: 'post-003',
    nombre: 'Helado La Fageda 500 ml',
    categoria: 'Postres',
    precio: 6.95,
    stock: 30,
    descripcion: 'Yogur, stracciatella, mango, vainilla-macadamia, chocolate negro, caramelo, galleta-chocolate',
    imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'PST-003',
    iva: 10
  },
  {
    id: 'post-004',
    nombre: 'Helado La Fageda 100 ml',
    categoria: 'Postres',
    precio: 3.75,
    stock: 50,
    descripcion: 'Yogur, fresa, limón, chocolate, vainilla-macadamia, crema catalana, turrón, café',
    imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'PST-004',
    iva: 10
  },

  // ==========================================
  // 🧃 6) BEBIDAS SIN ALCOHOL (10 productos)
  // ==========================================
  {
    id: 'beb-001',
    nombre: 'Coca-Cola lata 330 ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 100,
    descripcion: 'Coca-Cola clásica en lata de 330ml',
    imagen: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BEB-001',
    iva: 21
  },
  {
    id: 'beb-002',
    nombre: 'Coca-Cola Zero lata 330 ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 100,
    descripcion: 'Coca-Cola Zero en lata de 330ml',
    imagen: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BEB-002',
    iva: 21
  },
  {
    id: 'beb-003',
    nombre: 'Fanta Naranja lata 330 ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 80,
    descripcion: 'Fanta naranja en lata de 330ml',
    imagen: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BEB-003',
    iva: 21
  },
  {
    id: 'beb-004',
    nombre: 'Fanta Limón lata 330 ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 80,
    descripcion: 'Fanta limón en lata de 330ml',
    imagen: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BEB-004',
    iva: 21
  },
  {
    id: 'beb-005',
    nombre: 'Aquarius Naranja lata 330 ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 70,
    descripcion: 'Aquarius naranja en lata de 330ml',
    imagen: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BEB-005',
    iva: 21
  },
  {
    id: 'beb-006',
    nombre: 'Aquarius Limón lata 330 ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 70,
    descripcion: 'Aquarius limón en lata de 330ml',
    imagen: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BEB-006',
    iva: 21
  },
  {
    id: 'beb-007',
    nombre: 'Nestea Té Negro Limón lata 330 ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 60,
    descripcion: 'Nestea té negro con limón en lata de 330ml',
    imagen: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BEB-007',
    iva: 21
  },
  {
    id: 'beb-008',
    nombre: 'Agua 330 ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.20,
    stock: 100,
    descripcion: 'Agua mineral natural 330ml',
    imagen: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BEB-008',
    iva: 10
  },
  {
    id: 'beb-009',
    nombre: 'Fanta Naranja botella 2 L',
    categoria: 'Bebidas sin Alcohol',
    precio: 3.50,
    stock: 20,
    descripcion: 'Fanta naranja en botella de 2 litros',
    imagen: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BEB-009',
    iva: 21
  },
  {
    id: 'beb-010',
    nombre: 'Fanta Limón botella 2 L',
    categoria: 'Bebidas sin Alcohol',
    precio: 3.50,
    stock: 20,
    descripcion: 'Fanta limón en botella de 2 litros',
    imagen: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'BEB-010',
    iva: 21
  },

  // ==========================================
  // 🍺 7) BEBIDAS CON ALCOHOL (10 productos)
  // ==========================================
  // Cervezas
  {
    id: 'alc-001',
    nombre: 'Cerveza Estrella Damm 33 cl',
    categoria: 'Bebidas con Alcohol',
    precio: 1.90,
    stock: 80,
    descripcion: 'Cerveza Estrella Damm 33cl',
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ALC-001',
    iva: 21
  },
  {
    id: 'alc-002',
    nombre: 'Cerveza Voll-Damm 33 cl',
    categoria: 'Bebidas con Alcohol',
    precio: 1.80,
    stock: 60,
    descripcion: 'Cerveza Voll-Damm doble malta 33cl',
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ALC-002',
    iva: 21
  },
  {
    id: 'alc-003',
    nombre: 'Cerveza Moretti 33 cl',
    categoria: 'Bebidas con Alcohol',
    precio: 2.50,
    stock: 40,
    descripcion: 'Cerveza italiana Moretti botella 33cl',
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ALC-003',
    iva: 21
  },
  {
    id: 'alc-004',
    nombre: 'Cerveza Peroni 33 cl',
    categoria: 'Bebidas con Alcohol',
    precio: 2.50,
    stock: 35,
    descripcion: 'Cerveza italiana Peroni 33cl',
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ALC-004',
    iva: 21
  },
  {
    id: 'alc-005',
    nombre: 'Cerveza Desperados 33 cl',
    categoria: 'Bebidas con Alcohol',
    precio: 2.75,
    stock: 30,
    descripcion: 'Cerveza Desperados con tequila 33cl',
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ALC-005',
    iva: 21
  },
  {
    id: 'alc-006',
    nombre: 'Cerveza Amstel Radler 33 cl',
    categoria: 'Bebidas con Alcohol',
    precio: 2.20,
    stock: 50,
    descripcion: 'Cerveza Amstel Radler con limón 33cl',
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ALC-006',
    iva: 21
  },
  {
    id: 'alc-007',
    nombre: 'Cerveza Moritz 0,0% 33 cl',
    categoria: 'Bebidas con Alcohol',
    precio: 2.20,
    stock: 60,
    descripcion: 'Cerveza sin alcohol Moritz 33cl',
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ALC-007',
    iva: 21
  },
  // Vinos
  {
    id: 'alc-008',
    nombre: 'Vino Rosado 75 cl',
    categoria: 'Bebidas con Alcohol',
    precio: 8.25,
    stock: 18,
    descripcion: 'Vino rosado de la casa 75cl',
    imagen: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ALC-008',
    iva: 21
  },
  {
    id: 'alc-009',
    nombre: 'Vino Blanco 75 cl',
    categoria: 'Bebidas con Alcohol',
    precio: 8.25,
    stock: 20,
    descripcion: 'Vino blanco de la casa 75cl',
    imagen: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ALC-009',
    iva: 21
  },
  {
    id: 'alc-010',
    nombre: 'Lambrusco 75 cl',
    categoria: 'Bebidas con Alcohol',
    precio: 5.50,
    stock: 25,
    descripcion: 'Vino espumoso italiano Lambrusco 75cl',
    imagen: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    marcas_ids: ['MRC-002'],
    activo: true,
    visible_tpv: true,
    sku: 'ALC-010',
    iva: 21
  },

  // ==========================================
  // 🍕 MODOMMIO - COMBOS (4 productos)
  // ==========================================
  {
    id: 'mod-combo-001',
    nombre: 'Combo Modomio',
    categoria: 'Combos',
    precio: 20.99,
    stock: 50,
    descripcion: '1 pizza + 1 complemento + 1 refresco (330 ml) + 1 helado (100 ml)',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CMB-001',
    iva: 10,
    // 🍕 OPCIONES PERSONALIZABLES DEL COMBO MODOMIO
    gruposOpciones: [
      {
        id: 'pizza',
        titulo: 'Elige tu Pizza',
        descripcion: 'Selecciona 1 pizza',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'margarita', nombre: 'Margarita', precioAdicional: 0 },
          { id: 'prosciutto', nombre: 'Prosciutto', precioAdicional: 0 },
          { id: 'funghi', nombre: 'Funghi', precioAdicional: 0 },
          { id: 'bacon', nombre: 'Bacon', precioAdicional: 0 },
          { id: 'pepperoni', nombre: 'Pepperoni', precioAdicional: 0 },
          { id: 'premium', nombre: 'Premium (Mamma Mia)', precioAdicional: 2.00 },
        ]
      },
      {
        id: 'complemento',
        titulo: 'Elige tu Complemento',
        descripcion: 'Selecciona 1 complemento',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'chicken-balls', nombre: 'Chicken Balls', precioAdicional: 0 },
          { id: 'nuggets', nombre: 'Nuggets', precioAdicional: 0 },
          { id: 'patatas-monalisa', nombre: 'Patatas Monalisa', precioAdicional: 0 },
          { id: 'patatas-supreme', nombre: 'Patatas Supreme', precioAdicional: 1.00 },
        ]
      },
      {
        id: 'refresco',
        titulo: 'Elige tu Refresco',
        descripcion: 'Selecciona 1 bebida (330 ml)',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'coca', nombre: 'Coca-Cola', precioAdicional: 0 },
          { id: 'fanta', nombre: 'Fanta Naranja', precioAdicional: 0 },
          { id: 'sprite', nombre: 'Sprite', precioAdicional: 0 },
          { id: 'agua', nombre: 'Agua Mineral', precioAdicional: 0 },
        ]
      },
      {
        id: 'helado',
        titulo: 'Elige tu Helado',
        descripcion: 'Selecciona 1 helado (100 ml)',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'vainilla', nombre: 'Vainilla', precioAdicional: 0 },
          { id: 'chocolate', nombre: 'Chocolate', precioAdicional: 0 },
          { id: 'fresa', nombre: 'Fresa', precioAdicional: 0 },
          { id: 'stracciatella', nombre: 'Stracciatella', precioAdicional: 0 },
        ]
      }
    ]
  },
  {
    id: 'mod-combo-002',
    nombre: 'Combo Individual',
    categoria: 'Combos',
    precio: 16.99,
    stock: 50,
    descripcion: '1 pizza + patatas + 1 refresco (330 ml)',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CMB-002',
    iva: 10,
    // 🍕 OPCIONES PERSONALIZABLES DEL COMBO INDIVIDUAL
    gruposOpciones: [
      {
        id: 'pizza',
        titulo: 'Elige tu Pizza',
        descripcion: 'Selecciona 1 pizza',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'margarita', nombre: 'Margarita', precioAdicional: 0 },
          { id: 'prosciutto', nombre: 'Prosciutto', precioAdicional: 0 },
          { id: 'funghi', nombre: 'Funghi', precioAdicional: 0 },
          { id: 'bacon', nombre: 'Bacon', precioAdicional: 0 },
          { id: 'pepperoni', nombre: 'Pepperoni', precioAdicional: 0 },
          { id: 'premium', nombre: 'Premium (Mamma Mia)', precioAdicional: 2.00 },
        ]
      },
      {
        id: 'refresco',
        titulo: 'Elige tu Refresco',
        descripcion: 'Selecciona 1 bebida (330 ml)',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'coca', nombre: 'Coca-Cola', precioAdicional: 0 },
          { id: 'fanta', nombre: 'Fanta Naranja', precioAdicional: 0 },
          { id: 'sprite', nombre: 'Sprite', precioAdicional: 0 },
          { id: 'agua', nombre: 'Agua Mineral', precioAdicional: 0 },
        ]
      }
    ]
  },
  {
    id: 'mod-combo-003',
    nombre: 'Combo Dúo',
    categoria: 'Combos',
    precio: 29.99,
    stock: 40,
    descripcion: '2 pizzas + patatas + 2 refrescos (330 ml)',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CMB-003',
    iva: 10,
    // 🍕 OPCIONES PERSONALIZABLES DEL COMBO DÚO
    gruposOpciones: [
      {
        id: 'pizzas',
        titulo: 'Elige tus Pizzas',
        descripcion: 'Selecciona 2 pizzas',
        obligatorio: true,
        minSeleccion: 2,
        maxSeleccion: 2,
        opciones: [
          { id: 'margarita', nombre: 'Margarita', precioAdicional: 0 },
          { id: 'prosciutto', nombre: 'Prosciutto', precioAdicional: 0 },
          { id: 'funghi', nombre: 'Funghi', precioAdicional: 0 },
          { id: 'bacon', nombre: 'Bacon', precioAdicional: 0 },
          { id: 'pepperoni', nombre: 'Pepperoni', precioAdicional: 0 },
          { id: 'premium', nombre: 'Premium (Mamma Mia)', precioAdicional: 2.00 },
        ]
      },
      {
        id: 'refrescos',
        titulo: 'Elige tus Refrescos',
        descripcion: 'Selecciona 2 bebidas (330 ml)',
        obligatorio: true,
        minSeleccion: 2,
        maxSeleccion: 2,
        opciones: [
          { id: 'coca', nombre: 'Coca-Cola', precioAdicional: 0 },
          { id: 'fanta', nombre: 'Fanta Naranja', precioAdicional: 0 },
          { id: 'sprite', nombre: 'Sprite', precioAdicional: 0 },
          { id: 'agua', nombre: 'Agua Mineral', precioAdicional: 0 },
        ]
      }
    ]
  },
  {
    id: 'mod-combo-004',
    nombre: 'Combo Family',
    categoria: 'Combos',
    precio: 48.99,
    stock: 30,
    descripcion: '3 pizzas + 2 complementos + 4 refrescos (330 ml)',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CMB-004',
    iva: 10,
    // 🍕 OPCIONES PERSONALIZABLES DEL COMBO FAMILY
    gruposOpciones: [
      {
        id: 'pizzas',
        titulo: 'Elige tus Pizzas',
        descripcion: 'Selecciona 3 pizzas',
        obligatorio: true,
        minSeleccion: 3,
        maxSeleccion: 3,
        opciones: [
          { id: 'margarita', nombre: 'Margarita', precioAdicional: 0 },
          { id: 'prosciutto', nombre: 'Prosciutto', precioAdicional: 0 },
          { id: 'funghi', nombre: 'Funghi', precioAdicional: 0 },
          { id: 'bacon', nombre: 'Bacon', precioAdicional: 0 },
          { id: 'pepperoni', nombre: 'Pepperoni', precioAdicional: 0 },
          { id: 'premium', nombre: 'Premium (Mamma Mia)', precioAdicional: 2.00 },
        ]
      },
      {
        id: 'complementos',
        titulo: 'Elige tus Complementos',
        descripcion: 'Selecciona 2 complementos',
        obligatorio: true,
        minSeleccion: 2,
        maxSeleccion: 2,
        opciones: [
          { id: 'chicken-balls', nombre: 'Chicken Balls', precioAdicional: 0 },
          { id: 'nuggets', nombre: 'Nuggets', precioAdicional: 0 },
          { id: 'patatas-monalisa', nombre: 'Patatas Monalisa', precioAdicional: 0 },
          { id: 'patatas-supreme', nombre: 'Patatas Supreme', precioAdicional: 1.00 },
        ]
      },
      {
        id: 'refrescos',
        titulo: 'Elige tus Refrescos',
        descripcion: 'Selecciona 4 bebidas (330 ml)',
        obligatorio: true,
        minSeleccion: 4,
        maxSeleccion: 4,
        opciones: [
          { id: 'coca', nombre: 'Coca-Cola', precioAdicional: 0 },
          { id: 'fanta', nombre: 'Fanta Naranja', precioAdicional: 0 },
          { id: 'sprite', nombre: 'Sprite', precioAdicional: 0 },
          { id: 'agua', nombre: 'Agua Mineral', precioAdicional: 0 },
        ]
      }
    ]
  },

  // ==========================================
  // 🟡 MODOMMIO - PIZZAS PREMIUM (7 productos)
  // ==========================================
  {
    id: 'mod-prem-001',
    nombre: 'Pizza al gusto (5 ingredientes)',
    categoria: 'Pizzas Premium',
    precio: 15.00,
    stock: 50,
    descripcion: 'Base tomate + queso + 5 ingredientes a elegir',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-PREM-001',
    iva: 10
  },
  {
    id: 'mod-prem-002',
    nombre: 'Premium Mamma Mia',
    categoria: 'Pizzas Premium',
    precio: 15.00,
    stock: 40,
    descripcion: 'Tomate, mozzarella, jamón York, Frankfurt, nata, parmesano',
    imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-PREM-002',
    iva: 10
  },
  {
    id: 'mod-prem-003',
    nombre: 'Premium Marinera',
    categoria: 'Pizzas Premium',
    precio: 15.50,
    stock: 35,
    descripcion: 'Tomate, mozzarella, gambas, ajo, perejil, atún, cebolla',
    imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-PREM-003',
    iva: 10
  },
  {
    id: 'mod-prem-004',
    nombre: 'Premium Mitad y Mitad',
    categoria: 'Pizzas Premium',
    precio: 15.50,
    stock: 45,
    descripcion: 'Dos pizzas en una, a elegir',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-PREM-004',
    iva: 10
  },
  {
    id: 'mod-prem-005',
    nombre: 'Premium Primavera',
    categoria: 'Pizzas Premium',
    precio: 15.50,
    stock: 38,
    descripcion: 'Tomate, mozzarella, rúcula, jamón ibérico, tomate, queso fresco',
    imagen: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-PREM-005',
    iva: 10
  },
  {
    id: 'mod-prem-006',
    nombre: 'Premium Avocado',
    categoria: 'Pizzas Premium',
    precio: 15.00,
    stock: 42,
    descripcion: 'Tomate, mozzarella, carne, cebolla, aguacate, tabasco',
    imagen: 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-PREM-006',
    iva: 10
  },
  {
    id: 'mod-prem-007',
    nombre: 'Premium Trufada',
    categoria: 'Pizzas Premium',
    precio: 15.00,
    stock: 36,
    descripcion: 'Mozzarella, champiñones, salsa trufa y parmesano',
    imagen: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-PREM-007',
    iva: 10
  },

  // ==========================================
  // 🟢 MODOMMIO - PIZZAS CLÁSICAS (27 productos)
  // ==========================================
  {
    id: 'mod-clas-001',
    nombre: 'Pizza al gusto (3 ingredientes)',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 50,
    descripcion: 'Base tomate + queso + 3 ingredientes a elegir',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-001',
    iva: 10
  },
  {
    id: 'mod-clas-002',
    nombre: 'Margarita',
    categoria: 'Pizzas Clásicas',
    precio: 12.50,
    stock: 60,
    descripcion: 'Tomate, mozzarella, orégano',
    imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-002',
    iva: 10
  },
  {
    id: 'mod-clas-003',
    nombre: 'Prosciutto',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 45,
    descripcion: 'Tomate, mozzarella, jamón York',
    imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-003',
    iva: 10
  },
  {
    id: 'mod-clas-004',
    nombre: 'Funghi',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 40,
    descripcion: 'Tomate, mozzarella, champiñones, nata',
    imagen: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-004',
    iva: 10
  },
  {
    id: 'mod-clas-005',
    nombre: 'Bacon',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 42,
    descripcion: 'Tomate, mozzarella, bacon',
    imagen: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-005',
    iva: 10
  },
  {
    id: 'mod-clas-006',
    nombre: 'Al Pesto',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 38,
    descripcion: 'Tomate cherry, mozzarella, búfala, pesto',
    imagen: 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-006',
    iva: 10
  },
  {
    id: 'mod-clas-007',
    nombre: 'Calzone Cerrada',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 35,
    descripcion: 'Tomate, mozzarella, jamón York, champiñones',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-007',
    iva: 10
  },
  {
    id: 'mod-clas-008',
    nombre: 'Pepperoni',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 50,
    descripcion: 'Tomate, mozzarella, champiñones, pepperoni',
    imagen: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-008',
    iva: 10
  },
  {
    id: 'mod-clas-009',
    nombre: 'Vegetal',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 32,
    descripcion: 'Tomate, mozzarella, berenjena, cebolla, olivas, pimiento rojo',
    imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-009',
    iva: 10
  },
  {
    id: 'mod-clas-010',
    nombre: '4 Estaciones',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 38,
    descripcion: 'Tomate, mozzarella, jamón York, champiñones, alcachofas',
    imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-010',
    iva: 10
  },
  {
    id: 'mod-clas-011',
    nombre: 'Di Maiale',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 36,
    descripcion: 'Tomate, mozzarella, berenjena, bacon',
    imagen: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-011',
    iva: 10
  },
  {
    id: 'mod-clas-012',
    nombre: 'Porcavacca',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 40,
    descripcion: 'Tomate, mozzarella, jamón York, nata',
    imagen: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-012',
    iva: 10
  },
  {
    id: 'mod-clas-013',
    nombre: 'Calzone Aperta',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 34,
    descripcion: 'Tomate, mozzarella, jamón York, champiñones',
    imagen: 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-013',
    iva: 10
  },
  {
    id: 'mod-clas-014',
    nombre: 'Carbonara',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 42,
    descripcion: 'Mozzarella, nata, bacon, huevo, cebolla',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-014',
    iva: 10
  },
  {
    id: 'mod-clas-015',
    nombre: 'Hawaiana',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 38,
    descripcion: 'Tomate, mozzarella, jamón York, piña',
    imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-015',
    iva: 10
  },
  {
    id: 'mod-clas-016',
    nombre: '4 Quesos',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 36,
    descripcion: 'Tomate, mozzarella, cabra, parmesano, Roquefort',
    imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-016',
    iva: 10
  },
  {
    id: 'mod-clas-017',
    nombre: 'Barbacoa',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 44,
    descripcion: 'Mozzarella, carne picada, bacon, salsa BBQ',
    imagen: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-017',
    iva: 10
  },
  {
    id: 'mod-clas-018',
    nombre: 'La Pallesa',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 30,
    descripcion: 'Tomate, mozzarella, butifarra, cebolla caramelizada, brie, miel',
    imagen: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-018',
    iva: 10
  },
  {
    id: 'mod-clas-019',
    nombre: 'Mallorquina',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 32,
    descripcion: 'Tomate, mozzarella, sobrasada, brie, miel',
    imagen: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-019',
    iva: 10
  },
  {
    id: 'mod-clas-020',
    nombre: 'Contadino',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 40,
    descripcion: 'Tomate, mozzarella, bacon, pollo, champiñones',
    imagen: 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-020',
    iva: 10
  },
  {
    id: 'mod-clas-021',
    nombre: 'Apericena',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 36,
    descripcion: 'Tomate, mozzarella, atún, cebolla, olivas',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-021',
    iva: 10
  },
  {
    id: 'mod-clas-022',
    nombre: 'Caprichosa',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 38,
    descripcion: 'Tomate, mozzarella, jamón York, champiñones, alcachofas, olivas',
    imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-022',
    iva: 10
  },
  {
    id: 'mod-clas-023',
    nombre: 'Ibérica',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 34,
    descripcion: 'Tomate, mozzarella, brie, jamón ibérico',
    imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-023',
    iva: 10
  },
  {
    id: 'mod-clas-024',
    nombre: 'Sanginaccio',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 28,
    descripcion: 'Tomate, mozzarella, morcilla, cebolla caramelizada, cabra',
    imagen: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-024',
    iva: 10
  },
  {
    id: 'mod-clas-025',
    nombre: 'Mediterránea',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 32,
    descripcion: 'Tomate, mozzarella, anchoas, tomate cherry, olivas negras',
    imagen: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-025',
    iva: 10
  },
  {
    id: 'mod-clas-026',
    nombre: 'La Vegana',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 26,
    descripcion: 'Queso vegano, tomate natural, berenjena, tomate cherry, olivas negras, alcachofas',
    imagen: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-026',
    iva: 10
  },
  {
    id: 'mod-clas-027',
    nombre: 'Berencabra',
    categoria: 'Pizzas Clásicas',
    precio: 14.00,
    stock: 30,
    descripcion: 'Tomate, mozzarella, berenjena, queso de cabra, miel',
    imagen: 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-CLAS-027',
    iva: 10
  },

  // ==========================================
  // 🟠 MODOMMIO - ENTRANTES (5 productos)
  // ==========================================
  {
    id: 'mod-ent-001',
    nombre: 'Chicken Balls',
    categoria: 'Entrantes',
    precio: 4.40,
    stock: 80,
    descripcion: 'Bolitas de pollo',
    imagen: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ENT-001',
    iva: 10
  },
  {
    id: 'mod-ent-002',
    nombre: 'Nuggets',
    categoria: 'Entrantes',
    precio: 4.40,
    stock: 75,
    descripcion: 'Bolitas de pollo crujientes',
    imagen: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ENT-002',
    iva: 10
  },
  {
    id: 'mod-ent-003',
    nombre: 'Patatas Monalisa',
    categoria: 'Entrantes',
    precio: 4.20,
    stock: 90,
    descripcion: 'Patatas en espiral',
    imagen: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ENT-003',
    iva: 10
  },
  {
    id: 'mod-ent-004',
    nombre: 'Patatas Supreme',
    categoria: 'Entrantes',
    precio: 5.20,
    stock: 70,
    descripcion: 'Con salsa trufa y parmesano',
    imagen: 'https://images.unsplash.com/photo-1630409346682-4dc70c29220c?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ENT-004',
    iva: 10
  },
  {
    id: 'mod-ent-005',
    nombre: 'Alitas Fritas',
    categoria: 'Entrantes',
    precio: 5.20,
    stock: 65,
    descripcion: 'Alitas caseras crujientes',
    imagen: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ENT-005',
    iva: 10
  },

  // ==========================================
  // 🍨 MODOMMIO - POSTRES (6 productos)
  // ==========================================
  {
    id: 'mod-post-001',
    nombre: 'Helado La Fageda 500ml',
    categoria: 'Postres',
    precio: 6.95,
    stock: 40,
    descripcion: 'Varios sabores',
    imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-POST-001',
    iva: 10
  },
  {
    id: 'mod-post-002',
    nombre: 'Helado La Fageda 100ml',
    categoria: 'Postres',
    precio: 3.75,
    stock: 60,
    descripcion: 'Varios sabores',
    imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-POST-002',
    iva: 10
  },
  {
    id: 'mod-post-003',
    nombre: 'Tiramisú',
    categoria: 'Postres',
    precio: 5.50,
    stock: 35,
    descripcion: 'Postre italiano tradicional',
    imagen: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-POST-003',
    iva: 10
  },
  {
    id: 'mod-post-004',
    nombre: 'Tiramisú Oreo',
    categoria: 'Postres',
    precio: 5.95,
    stock: 32,
    descripcion: 'Tiramisú con galletas Oreo',
    imagen: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-POST-004',
    iva: 10
  },
  {
    id: 'mod-post-005',
    nombre: 'Pizza Nutella 25cm',
    categoria: 'Postres',
    precio: 7.50,
    stock: 45,
    descripcion: 'Pizza dulce con Nutella',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-POST-005',
    iva: 10
  },
  {
    id: 'mod-post-006',
    nombre: 'Pizza Nutella y Oreo 25cm',
    categoria: 'Postres',
    precio: 8.00,
    stock: 40,
    descripcion: 'Pizza dulce con Nutella y Oreo',
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-POST-006',
    iva: 10
  },

  // ==========================================
  // 🧃 MODOMMIO - BEBIDAS SIN ALCOHOL (10 productos)
  // ==========================================
  {
    id: 'mod-beb-001',
    nombre: 'Agua 330ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.20,
    stock: 150,
    descripcion: 'Agua mineral',
    imagen: 'https://images.unsplash.com/photo-1559821642-3f0e47b8f1b3?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-BEB-001',
    iva: 10
  },
  {
    id: 'mod-beb-002',
    nombre: 'Coca-Cola 330ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 120,
    descripcion: 'Coca-Cola lata',
    imagen: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-BEB-002',
    iva: 10
  },
  {
    id: 'mod-beb-003',
    nombre: 'Coca-Cola Zero 330ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 110,
    descripcion: 'Coca-Cola Zero lata',
    imagen: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-BEB-003',
    iva: 10
  },
  {
    id: 'mod-beb-004',
    nombre: 'Fanta Naranja 330ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 100,
    descripcion: 'Fanta Naranja lata',
    imagen: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-BEB-004',
    iva: 10
  },
  {
    id: 'mod-beb-005',
    nombre: 'Fanta Limón 330ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 95,
    descripcion: 'Fanta Limón lata',
    imagen: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-BEB-005',
    iva: 10
  },
  {
    id: 'mod-beb-006',
    nombre: 'Aquarius Naranja 330ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 85,
    descripcion: 'Aquarius Naranja lata',
    imagen: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-BEB-006',
    iva: 10
  },
  {
    id: 'mod-beb-007',
    nombre: 'Aquarius Limón 330ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 80,
    descripcion: 'Aquarius Limón lata',
    imagen: 'https://images.unsplash.com/photo-1625772452888-7e5b12f190a2?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-BEB-007',
    iva: 10
  },
  {
    id: 'mod-beb-008',
    nombre: 'Nestea 330ml',
    categoria: 'Bebidas sin Alcohol',
    precio: 1.90,
    stock: 90,
    descripcion: 'Nestea lata',
    imagen: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-BEB-008',
    iva: 10
  },
  {
    id: 'mod-beb-009',
    nombre: 'Fanta Limón 2L',
    categoria: 'Bebidas sin Alcohol',
    precio: 3.50,
    stock: 45,
    descripcion: 'Fanta Limón botella 2 litros',
    imagen: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-BEB-009',
    iva: 10
  },
  {
    id: 'mod-beb-010',
    nombre: 'Fanta Naranja 2L',
    categoria: 'Bebidas sin Alcohol',
    precio: 3.50,
    stock: 50,
    descripcion: 'Fanta Naranja botella 2 litros',
    imagen: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-BEB-010',
    iva: 10
  },

  // ==========================================
  // 🍺 MODOMMIO - BEBIDAS CON ALCOHOL (10 productos)
  // ==========================================
  {
    id: 'mod-alc-001',
    nombre: 'Estrella Damm',
    categoria: 'Bebidas con Alcohol',
    precio: 1.90,
    stock: 80,
    descripcion: 'Cerveza Estrella Damm',
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ALC-001',
    iva: 21
  },
  {
    id: 'mod-alc-002',
    nombre: 'Voll-Damm',
    categoria: 'Bebidas con Alcohol',
    precio: 1.80,
    stock: 70,
    descripcion: 'Cerveza Voll-Damm',
    imagen: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ALC-002',
    iva: 21
  },
  {
    id: 'mod-alc-003',
    nombre: 'Moretti',
    categoria: 'Bebidas con Alcohol',
    precio: 2.50,
    stock: 60,
    descripcion: 'Cerveza Moretti',
    imagen: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ALC-003',
    iva: 21
  },
  {
    id: 'mod-alc-004',
    nombre: 'Peroni',
    categoria: 'Bebidas con Alcohol',
    precio: 2.50,
    stock: 55,
    descripcion: 'Cerveza Peroni',
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ALC-004',
    iva: 21
  },
  {
    id: 'mod-alc-005',
    nombre: 'Desperados',
    categoria: 'Bebidas con Alcohol',
    precio: 2.75,
    stock: 50,
    descripcion: 'Cerveza Desperados',
    imagen: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ALC-005',
    iva: 21
  },
  {
    id: 'mod-alc-006',
    nombre: 'Amstel Radler',
    categoria: 'Bebidas con Alcohol',
    precio: 2.20,
    stock: 65,
    descripcion: 'Cerveza Amstel Radler',
    imagen: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ALC-006',
    iva: 21
  },
  {
    id: 'mod-alc-007',
    nombre: 'Moritz 0,0%',
    categoria: 'Bebidas con Alcohol',
    precio: 2.20,
    stock: 60,
    descripcion: 'Cerveza Moritz sin alcohol',
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ALC-007',
    iva: 21
  },
  {
    id: 'mod-alc-008',
    nombre: 'Vino Rosado 75cl',
    categoria: 'Bebidas con Alcohol',
    precio: 8.25,
    stock: 25,
    descripcion: 'Vino rosado de la casa',
    imagen: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ALC-008',
    iva: 21
  },
  {
    id: 'mod-alc-009',
    nombre: 'Vino Blanco 75cl',
    categoria: 'Bebidas con Alcohol',
    precio: 8.25,
    stock: 28,
    descripcion: 'Vino blanco de la casa',
    imagen: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ALC-009',
    iva: 21
  },
  {
    id: 'mod-alc-010',
    nombre: 'Lambrusco 75cl',
    categoria: 'Bebidas con Alcohol',
    precio: 5.50,
    stock: 30,
    descripcion: 'Vino espumoso italiano Lambrusco',
    imagen: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    marcas_ids: ['MRC-001'],
    activo: true,
    visible_tpv: true,
    sku: 'MOD-ALC-010',
    iva: 21
  },
];

// ============================================
// CONTEXT
// ============================================

interface ProductosContextType {
  productos: Producto[];
  categorias: string[];
  agregarProducto: (producto: Producto) => void;
  actualizarProducto: (id: string, producto: Partial<Producto>) => void;
  eliminarProducto: (id: string) => void;
  agregarCategoria: (categoria: string) => void;
  obtenerProductosPorMarca: (marcaId: string) => Producto[];
  obtenerProductosPorCategoria: (categoria: string) => Producto[];
  
  // ✅ NUEVAS FUNCIONES - FASE 2
  obtenerProducto: (id: string) => Producto | undefined;
  actualizarStock: (id: string, nuevoStock: number) => void;
  incrementarStock: (id: string, cantidad: number) => void;
  decrementarStock: (id: string, cantidad: number) => boolean;
  verificarDisponibilidad: (id: string, cantidad: number, sessionId?: string) => {
    disponible: boolean;
    stockReal: number;
    stockReservado: number;
    stockDisponible: number;
  };
}

const ProductosContext = createContext<ProductosContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function ProductosProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_INICIALES);
  const [categorias, setCategorias] = useState<string[]>(CATEGORIAS_PRODUCTOS);
  const [cargandoApi, setCargandoApi] = useState(true);

  // ✅ CARGAR PRODUCTOS DESDE API AL INICIAR
  useEffect(() => {
    const cargarProductosDesdeAPI = async () => {
      try {
        setCargandoApi(true);
        const productosBackend = await productosApi.getAll();
        
        if (productosBackend && productosBackend.length > 0) {
          // Función para detectar marca basándose en el nombre del producto
          const detectarMarcas = (nombre: string, descripcion: string): string[] => {
            const texto = `${nombre} ${descripcion}`.toLowerCase();
            const marcas: string[] = [];
            
            // Productos de MODOMMIO (pizzas, pastas, italianos)
            if (texto.includes('pizza') || texto.includes('pasta') || texto.includes('risotto') || 
                texto.includes('calzone') || texto.includes('lasagna') || texto.includes('italiana')) {
              marcas.push('MRC-001'); // MODOMMIO
            }
            
            // Productos de BLACKBURGER (hamburguesas, burgers, grill)
            if (texto.includes('burger') || texto.includes('hamburguesa') || texto.includes('bacon') || 
                texto.includes('parrilla') || texto.includes('grill') || texto.includes('bbq')) {
              marcas.push('MRC-002'); // BLACKBURGER
            }
            
            // Si no se detectó ninguna, asignar a ambas marcas
            if (marcas.length === 0) {
              marcas.push('MRC-001', 'MRC-002');
            }
            
            return marcas;
          };

          // Función para detectar categoría
          const detectarCategoria = (nombre: string, descripcion: string): string => {
            const texto = `${nombre} ${descripcion}`.toLowerCase();
            if (texto.includes('pizza')) return 'Pizzas';
            if (texto.includes('burger') || texto.includes('hamburguesa')) return 'Burgers';
            if (texto.includes('ensalada')) return 'Entrantes';
            if (texto.includes('pasta') || texto.includes('lasagna')) return 'Pastas';
            if (texto.includes('postre') || texto.includes('tarta') || texto.includes('helado')) return 'Postres';
            if (texto.includes('bebida') || texto.includes('refresco') || texto.includes('agua')) return 'Bebidas';
            return 'General';
          };

          // Mapear productos del backend al formato del contexto
          const productosMapeados: Producto[] = productosBackend.map(p => ({
            id: String(p.id),
            nombre: p.nombre,
            categoria: detectarCategoria(p.nombre, p.descripcion || ''),
            precio: p.precio,
            stock: p.stock,
            descripcion: p.descripcion,
            imagen: p.imagen,
            activo: true,
            visible_tpv: true,
            sku: `PRD-${p.id}`,
            iva: 10,
            marcas_ids: detectarMarcas(p.nombre, p.descripcion || ''),
          }));

          setProductos(productosMapeados);
          console.info('✅ Productos cargados desde API:', productosMapeados.length);
        } else {
          // Si no hay productos en el backend, usar los mock
          console.info('ℹ️ No hay productos en el backend, usando datos mock');
        }
      } catch (error) {
        console.error('❌ Error cargando productos desde API:', error);
        console.info('ℹ️ Usando productos mock como fallback');
        // Mantener productos mock en caso de error
      } finally {
        setCargandoApi(false);
      }
    };

    cargarProductosDesdeAPI();
  }, []);

  const agregarProducto = (producto: Producto) => {
    setProductos(prev => [...prev, producto]);
    
    // 🚀 Sincronizar automáticamente con plataformas de delivery
    deliverySyncService.sincronizarProducto(producto as ProductoDelivery, 'crear')
      .then(resultados => {
        const exitosos = resultados.filter(r => r.exitoso).length;
        if (exitosos > 0) {
          toast.success(`✅ Producto sincronizado con ${exitosos} plataforma(s) de delivery`);
        }
      })
      .catch(error => {
        console.error('Error sincronizando producto:', error);
      });
  };

  const actualizarProducto = (id: string, productoActualizado: Partial<Producto>) => {
    setProductos(prev =>
      prev.map(p => (p.id === id ? { ...p, ...productoActualizado } : p))
    );
    
    // 🚀 Sincronizar automáticamente con plataformas de delivery
    const productoCompleto = productos.find(p => p.id === id);
    if (productoCompleto) {
      const productoActualizadoCompleto = { ...productoCompleto, ...productoActualizado };
      deliverySyncService.sincronizarProducto(productoActualizadoCompleto as ProductoDelivery, 'actualizar')
        .then(resultados => {
          const exitosos = resultados.filter(r => r.exitoso).length;
          if (exitosos > 0) {
            toast.success(`✅ Cambios sincronizados con ${exitosos} plataforma(s) de delivery`);
          }
        })
        .catch(error => {
          console.error('Error sincronizando actualización:', error);
        });
    }
  };

  const eliminarProducto = (id: string) => {
    const productoAEliminar = productos.find(p => p.id === id);
    
    setProductos(prev => prev.filter(p => p.id !== id));
    
    // 🚀 Sincronizar automáticamente con plataformas de delivery
    if (productoAEliminar) {
      deliverySyncService.sincronizarProducto(productoAEliminar as ProductoDelivery, 'eliminar')
        .then(resultados => {
          const exitosos = resultados.filter(r => r.exitoso).length;
          if (exitosos > 0) {
            toast.success(`✅ Producto eliminado de ${exitosos} plataforma(s) de delivery`);
          }
        })
        .catch(error => {
          console.error('Error sincronizando eliminación:', error);
        });
    }
  };

  const agregarCategoria = (categoria: string) => {
    if (!categorias.includes(categoria)) {
      setCategorias(prev => [...prev, categoria]);
    }
  };

  const obtenerProductosPorMarca = (marcaId: string) => {
    return productos.filter(p => p.marcas_ids?.includes(marcaId) && p.activo && p.visible_tpv);
  };

  const obtenerProductosPorCategoria = (categoria: string) => {
    return productos.filter(p => p.categoria === categoria && p.activo && p.visible_tpv);
  };

  // ============================================================================
  // ✅ NUEVAS FUNCIONES - FASE 2
  // ============================================================================

  // Escuchar cambios de stock de otros tabs
  useEffect(() => {
    if (!stockChannel) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, productoId, stock } = event.data;

      if (type === 'STOCK_ACTUALIZADO') {
        setProductos(prev =>
          prev.map(p => (p.id === productoId ? { ...p, stock } : p))
        );
      }
    };

    stockChannel.onmessage = handleMessage;

    return () => {
      if (stockChannel) {
        stockChannel.onmessage = null;
      }
    };
  }, []);

  // Obtener un producto por ID
  const obtenerProducto = useCallback((id: string): Producto | undefined => {
    return productos.find(p => p.id === id);
  }, [productos]);

  // Actualizar stock directamente
  const actualizarStock = useCallback((id: string, nuevoStock: number) => {
    setProductos(prev =>
      prev.map(p => {
        if (p.id === id) {
          return { ...p, stock: nuevoStock };
        }
        return p;
      })
    );

    // ✅ Broadcast a otros tabs
    if (stockChannel) {
      stockChannel.postMessage({
        type: 'STOCK_ACTUALIZADO',
        productoId: id,
        stock: nuevoStock,
      });
    }

    console.info(`✅ Stock actualizado: ${id} → ${nuevoStock} unidades`);
  }, []);

  // Incrementar stock
  const incrementarStock = useCallback((id: string, cantidad: number) => {
    const producto = productos.find(p => p.id === id);
    if (!producto) {
      console.warn(`⚠️ Producto ${id} no encontrado`);
      return;
    }

    const nuevoStock = producto.stock + cantidad;
    actualizarStock(id, nuevoStock);
  }, [productos, actualizarStock]);

  // Decrementar stock
  const decrementarStock = useCallback((id: string, cantidad: number): boolean => {
    const producto = productos.find(p => p.id === id);
    if (!producto) {
      console.warn(`⚠️ Producto ${id} no encontrado`);
      return false;
    }

    if (producto.stock < cantidad) {
      console.warn(`⚠️ Stock insuficiente: ${producto.stock} < ${cantidad}`);
      return false;
    }

    const nuevoStock = producto.stock - cantidad;
    actualizarStock(id, nuevoStock);
    return true;
  }, [productos, actualizarStock]);

  // Verificar disponibilidad considerando reservas
  const verificarDisponibilidad = useCallback((
    id: string,
    cantidad: number,
    sessionId?: string
  ): {
    disponible: boolean;
    stockReal: number;
    stockReservado: number;
    stockDisponible: number;
  } => {
    const producto = productos.find(p => p.id === id);
    
    if (!producto) {
      return {
        disponible: false,
        stockReal: 0,
        stockReservado: 0,
        stockDisponible: 0,
      };
    }

    // Obtener stock reservado por otros (excluyendo la sesión actual)
    const stockReservado = stockReservationService.obtenerStockReservado(id, sessionId);
    const stockDisponible = producto.stock - stockReservado;

    return {
      disponible: stockDisponible >= cantidad && producto.activo !== false,
      stockReal: producto.stock,
      stockReservado,
      stockDisponible,
    };
  }, [productos]);

  return (
    <ProductosContext.Provider
      value={{
        productos,
        categorias,
        agregarProducto,
        actualizarProducto,
        eliminarProducto,
        agregarCategoria,
        obtenerProductosPorMarca,
        obtenerProductosPorCategoria,
        // ✅ FASE 2: Nuevas funciones
        obtenerProducto,
        actualizarStock,
        incrementarStock,
        decrementarStock,
        verificarDisponibilidad,
      }}
    >
      {children}
    </ProductosContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useProductos() {
  const context = useContext(ProductosContext);
  if (context === undefined) {
    throw new Error('useProductos debe usarse dentro de ProductosProvider');
  }
  return context;
}
