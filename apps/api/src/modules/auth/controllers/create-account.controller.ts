import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { Public } from '@/infra/auth/public';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { passwordSchema } from '@/shared/schemas/password.schema';
import { RegisterUserUseCase } from '../use-cases/register-user.usecase';

const createAccountBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: passwordSchema,
});

type CreateAccountBody = z.infer<typeof createAccountBodySchema>;

@Controller('/accounts')
@Public()
export class CreateAccountController {
  constructor(private registerUser: RegisterUserUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBody) {
    const { name, email, password } = body;

    await this.registerUser.execute({
      name,
      email,
      password,
    });
  }
}
