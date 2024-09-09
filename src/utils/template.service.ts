/* eslint-disable */
import { Injectable } from '@nestjs/common';

export interface TemplateVars {
  activationLink: string;
  currentYear: number;
  message: string;
}

@Injectable()
export class TemplatesService {
  private htmlTemplate: string;

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
                    <h1>¡Bienvenido a Nuestro Servicio!</h1>
                    <p>{{message}}</p>
                    <a href="{{activationLink}}" class="button">Activar Cuenta</a>
                    <p>Si no te registraste, ignora este correo.</p>
                    <div class="footer">
                        <p>&copy; {{currentYear}} Tu Empresa. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
  }

  getTemplate(vars: TemplateVars): string {
    return this.htmlTemplate
      .replace('{{activationLink}}', vars.activationLink)
      .replace('{{currentYear}}', vars.currentYear.toString())
      .replace('{{message}}', vars.message);
  }
}
