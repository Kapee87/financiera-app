/* eslint-disable */
/**
 * Este archivo es el punto de entrada de la aplicación.
 * Se utiliza para crear la instancia de la aplicación y configurar
 * las opciones de CORS.
 *
  Nahuel Montaner
 * @since 1.0.0
 * @version 1.0.0
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Función que se encarga de crear la instancia de la aplicación
 * y configurar las opciones de CORS.
 *
 * @returns {Promise<void>}
 */
async function bootstrap(): Promise<void> {
  const port = parseInt(process.env.PORT || '3000');
  const app = await NestFactory.create(AppModule);

  /**
   * Configuración de CORS
   * Se habilita CORS solo para el frontend en desarrollo
   * o para la URL de producción configurada en la variable de entorno
   * FRONTEND_URL.
   */
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'development'
        ? ['http://localhost:5173', 'http://localhost']
        : process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  /**
   * Inicia la escucha de la aplicación en el puerto configurado.
   */
  await app.listen(port);
}

/**
 * Se llama a la función bootstrap para iniciar la aplicación.
 */
bootstrap();
