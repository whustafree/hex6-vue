import { test, expect } from '@playwright/test';

test('El Mercado TCG carga correctamente', async ({ page }) => {
  // 1. El robot entra a la sección de TCG
  await page.goto('http://localhost:5173/tcg');

  // 2. Verifica que el título principal exista (ignoramos mayúsculas/minúsculas)
  const titulo = page.locator('h2');
  await expect(titulo).toContainText(/Mercado TCG/i);

  // 3. Verifica que la barra de búsqueda esté visible
  const buscador = page.getByPlaceholder('Buscar carta o juego...');
  await expect(buscador).toBeVisible();
});

test('La Vitrina Geek carga correctamente', async ({ page }) => {
  // 1. El robot entra a la sección de Vitrina
  await page.goto('http://localhost:5173/vitrina');

  // 2. Verifica que el título principal exista
  const titulo = page.locator('h2');
  await expect(titulo).toContainText(/Vitrina Geek/i);

  // 3. Verifica que la barra de búsqueda esté visible
  const buscador = page.getByPlaceholder('Buscar figura, consola...');
  await expect(buscador).toBeVisible();
});