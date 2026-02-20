import { test, expect } from '@playwright/test';

test('Robot Nivel Dios: Interfaz de Autenticación interactiva', async ({ page }) => {
  // 1. Va a la página de login
  await page.goto('http://localhost:5173/login');

  // 2. Hace clic en el botón de registrarse (simula a un humano)
  await page.click('text=¿No tienes cuenta?');
  
  // 3. Verifica que el formulario haya cambiado a modo Registro
  const tituloRegistro = page.locator('h2');
  await expect(tituloRegistro).toContainText(/Únete/i);
  await expect(page.locator('button[type="submit"]')).toContainText(/Registrarse/i);

  // 4. Hace clic para volver al login
  await page.click('text=¿Ya eres miembro?');
  
  // 5. Verifica que haya vuelto a la normalidad
  await expect(tituloRegistro).toContainText(/Bienvenido/i);
});

test('Robot Nivel Dios: Recuperación de contraseña', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  
  // Hace clic en Olvidé mi contraseña
  await page.click('text=Olvidé mi contraseña');
  
  // Verifica que el formulario cambie al modo recuperar
  const tituloRecuperar = page.locator('h2');
  await expect(tituloRecuperar).toContainText(/Recuperar/i);
  await expect(page.locator('button[type="submit"]')).toContainText(/Enviar Correo/i);
});