/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExpenseDto } from 'src/dtos/create-expense.dto';
import { Expense } from 'src/schemas/expense.schema';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const createdExpense = new this.expenseModel(createExpenseDto);
    return createdExpense.save();
  }

  async findAll(): Promise<Expense[]> {
    return this.expenseModel.find().exec();
  }

  async findOne(id: string): Promise<Expense> {
    return this.expenseModel.findById(id).exec();
  }

  async update(
    id: string,
    updateExpenseDto: Partial<CreateExpenseDto>,
  ): Promise<Expense> {
    return this.expenseModel
      .findByIdAndUpdate(id, updateExpenseDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.expenseModel.findByIdAndDelete(id).exec();
  }
}
