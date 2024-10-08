/* eslint-disable */
/**
 * M
 * Este modulo se encarga de manejar el envío de correos electrónicos
 * a traves de una cuenta de correo electrónico configurada en las
 * variables de entorno.
 *
  Carlos Espinoza
 * @since 1.0.0
 * @version 1.0.0
 */
import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  /**
   * Importa el modulo HTTP para poder hacer solicitudes
   * a traves de la red.
   */
  imports: [HttpModule],
  /**
   * Establece el servicio de correo electrónico
   * como proveedor del modulo.
   */
  providers: [MailerService],
  /**
   * Exporta el servicio de correo electrónico
   * para que pueda ser utilizado en otros modulos.
   */
  exports: [MailerService],
})
export class MailerModule {}

