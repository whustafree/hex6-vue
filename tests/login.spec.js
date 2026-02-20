import { test, expect } from '@playwright/test';

test('La pantalla de Login carga correctamente', async ({ page }) => {
  // 1. El robot entra a la URL de tu proyecto
  await page.goto('http://localhost:5173/login');

  // 2. Verifica que el título principal exista
  const titulo = page.locator('h2');
  await expect(titulo).toBeVisible();

  // 3. Verifica que exista un campo para poner el correo
  const campoEmail = page.locator('input[type="email"]');
  await expect(campoEmail).toBeVisible();

  // 4. Verifica que exista el botón para entrar
  const botonEntrar = page.locator('button[type="submit"]');
  await expect(botonEntrar).toBeVisible();
});