import { test, expect } from '@playwright/test';

test('El Buscador de Grupos (LFG) carga correctamente', async ({ page }) => {
  // 1. El robot entra a la sección de Grupos
  await page.goto('http://localhost:5173/grupos');

  // 2. Verifica que el título principal exista
  const titulo = page.locator('h2');
  await expect(titulo).toContainText(/Grupos/i); // <-- AHORA SÍ BUSCA LA PALABRA CORRECTA
});

test('Seguridad: Un usuario sin cuenta no puede entrar al Dashboard', async ({ page }) => {
  // 1. El robot intenta "colarse" directamente a la URL privada
  await page.goto('http://localhost:5173/dashboard');

  // 2. Verifica que el sistema lo redirija automáticamente a la página de Login
  await expect(page).toHaveURL(/.*login/);

  // 3. Verifica que esté viendo el formulario de entrada y no sus datos privados
  const botonEntrar = page.locator('button[type="submit"]');
  await expect(botonEntrar).toContainText('Entrar al Sistema');
});