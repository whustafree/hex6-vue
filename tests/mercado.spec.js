import { test, expect } from '@playwright/test';

test('El Mercado TCG carga correctamente', async ({ page }) => {
  // 1. Va a la ruta de TCG
  await page.goto('http://localhost:5173/tcg');
  
  // 2. Verifica que el título exista
  const titulo = page.locator('h2');
  await expect(titulo).toContainText(/TCG/i);
  
  // 3. Verifica que la barra de búsqueda esté visible (Texto Actualizado)
  const buscador = page.getByPlaceholder('Buscar carta, mazo o edición...');
  await expect(buscador).toBeVisible();
});

test('La Vitrina Geek carga correctamente', async ({ page }) => {
  // 1. Va a la ruta de Vitrina
  await page.goto('http://localhost:5173/vitrina');
  
  // 2. Verifica que el título exista
  const titulo = page.locator('h2');
  await expect(titulo).toContainText(/Vitrina/i);
  
  // 3. Verifica que la barra de búsqueda esté visible (Texto Actualizado)
  const buscador = page.getByPlaceholder('Buscar Funko, PS5, Manga...');
  await expect(buscador).toBeVisible();
});