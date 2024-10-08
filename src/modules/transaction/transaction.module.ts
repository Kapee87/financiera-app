/* eslint-disable */
/**
 * Módulo para la gestión de transacciones
 *
 * Este módulo contiene la lógica para crear, obtener, actualizar y eliminar transacciones
 *
  
 * @version 1.0.0
 * @since 2020-07-20
 */
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

/**
 * Servicio para la gestión de transacciones
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar transacciones
 *
  
 * @version 1.0.0
 * @since 2020-07-20
 */
import { TransactionService } from './transaction.service';

/**
 * Controlador para la gestión de transacciones
 *
 * Contiene métodos para crear, obtener, actualizar y eliminar transacciones
 *
  
 * @version 1.0.0
 * @since 2020-07-20
 */
import { TransactionController } from './transaction.controller';

/**
 * Esquema de transacciones
 *
 * Contiene la información de cada transacción realizada en el sistema
 *
 * @property {ObjectId} user - Identificador del usuario que realizó la transacción
 * @property {string} userName - Nombre del usuario que realizó la transacción
 * @property {ObjectId} subOffice - Identificador de la sucursal en la que se realizó la transacción
 * @property {string} subOfficeName - Nombre de la sucursal en la que se realizó la transacción
 * @property {ObjectId} sourceCurrency - Identificador de la moneda origen de la transacción
 * @property {string} sourceCurrencyCode - Código de la moneda origen de la transacción
 * @property {ObjectId} targetCurrency - Identificador de la moneda destino de la transacción
 * @property {string} targetCurrencyCode - Código de la moneda destino de la transacción
 * @property {number} sourceAmount - Monto de la transacción en la moneda origen
 * @property {number} targetAmount - Monto de la transacción en la moneda destino
 * @property {number} exchangeRate - Tasa de cambio de la transacción
 * @property {number} [commission] - Comisión de la transacción (opcional)
 * @property {string} type - Tipo de transacción (buy, sell o exchange)
 */
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';

/**
 * Módulo para la gestión de sucursales
 *
 * Este módulo contiene la lógica para crear, obtener, actualizar y eliminar sucursales
 *
  
 * @version 1.0.0
 * @since 2020-07-20
 */
import { SubOfficeModule } from '../sub_office/sub_office.module';

/**
 * Módulo para la gestión de monedas
 *
 * Este módulo contiene la lógica para crear, obtener, actualizar y eliminar monedas
 *
  
 * @version 1.0.0
 * @since 2020-07-20
 */
import { CurrencyModule } from '../currency/currency.module';

/**
 * Módulo para la gestión de cajas registradoras
 *
 * Este módulo contiene la lógica para crear, obtener, actualizar y eliminar cajas registradoras
 *
  
 * @version 1.0.0
 * @since 2020-07-20
 */
import { CashRegisterModule } from '../cash_register/cash-register.module';

/**
 * Módulo para la gestión de usuarios
 *
 * Este módulo contiene la lógica para crear, obtener, actualizar y eliminar usuarios
 *
  
 * @version 1.0.0
 * @since 2020-07-20
 */
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    forwardRef(() => SubOfficeModule),
    forwardRef(() => UsersModule),
    CurrencyModule,
    CashRegisterModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
