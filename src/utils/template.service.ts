/* eslint-disable */
/**
 * Servicio para generar correos electrónicos con plantillas HTML.
 *
 * Permite personalizar el contenido de los correos electrónicos
 * enviados a los usuarios, como el enlace de confirmación de
 * cuenta, el t&iacute;tulo y el mensaje.
 *
   Luis Alberto Méndez López
 * @version 1.0
 * @since   2022-05-05
 */
import { Injectable } from '@nestjs/common';

/**
 * Interfaz para los valores de las variables que se pueden personalizar
 * en la plantilla HTML.
 */
export interface TemplateVars {
  /**
   * Enlace que se mostrar&aacute; en el correo electrónico.
   */
  link: string;
  /**
   * A&ntilde;o actual para mostrar en el pie de p&aacute;gina.
   */
  currentYear: number;
  /**
   * Mensaje personalizado que se mostrar&aacute; en el correo electrónico.
   */
  message: string;
  /**
   * T&iacute;tulo del correo electrónico.
   */
  title: string;
  /**
   * Texto del botón que se mostrar&aacute; en el correo electrónico.
   */
  btn_text: string;
}

/**
 * Servicio que se encarga de generar correos electrónicos con
 * plantillas HTML.
 */
@Injectable()
export class TemplatesService {
  /**
   * Plantilla HTML que se utilizar&aacute; para generar el correo
   * electrónico.
   */
  private htmlTemplate: string;

  /**
   * Constructor que inicializa la plantilla HTML.
   */
  constructor() {
    this.htmlTemplate = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Activación de Cuenta</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: auto;
                        background: #ffffff;
                        border-radius: 5px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                    }
                    h1 {
                        color: #333;
                        text-align: center;
                    }
                    p {
                        color: #555;
                        line-height: 1.6;
                    }
                    .button {
                        display: block;
                        width: 100%;
                        max-width: 200px;
                        margin: 20px auto;
                        padding: 10px;
                        text-align: center;
                        background-color: #28a745;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        font-size: 12px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>¡Bienvenido a Nuestro Servicio de {{title}}!</h1>
                    <p>{{message}}</p>
                    <a href="{{link}}" class="button">{{btn_text}}</a>
                    <p>Si no te registraste, ignora este correo.</p>
                    <div class="footer">
                        <p>&copy; {{currentYear}} Tu Empresa. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
  }

  /**
   * Método que permite obtener la plantilla HTML personalizada
   * según los valores de las variables proporcionadas.
   * @param vars Valores de las variables que se pueden personalizar
   *             en la plantilla HTML.
   * @returns     La plantilla HTML personalizada.
   */
  getTemplate(vars: TemplateVars): string {
    return this.htmlTemplate
      .replace('{{link}}', vars.link)
      .replace('{{currentYear}}', vars.currentYear.toString())
      .replace('{{message}}', vars.message)
      .replace('{{title}}', vars.title)
      .replace('{{btn_text}}', vars.btn_text);
  }
}
