import React, { useState } from 'react';
import { crearCliente } from '../../services/cliente.service';

export default function CrearCuentaCliente() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    ciudad: '',
    idioma: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await crearCliente(form);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Crear cuenta</h2>
      <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre completo" className="w-full mb-2 p-2 border rounded" required />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" className="w-full mb-2 p-2 border rounded" required />
      <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="w-full mb-2 p-2 border rounded" />
      <input name="password" value={form.password} onChange={handleChange} placeholder="Contraseña" type="password" className="w-full mb-2 p-2 border rounded" required minLength={8} />
      <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Ciudad" className="w-full mb-2 p-2 border rounded" />
      <input name="idioma" value={form.idioma} onChange={handleChange} placeholder="Idioma" className="w-full mb-2 p-2 border rounded" />
      <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded mt-2" disabled={loading}>{loading ? 'Creando...' : 'Crear mi cuenta'}</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">¡Cuenta creada con éxito!</p>}
    </form>
  );
}
