import { CommandFactory } from 'nest-commander';
import { InitModule } from './init/init.module';

async function bootstrap() {
    await CommandFactory.run(InitModule, ['warn', 'error']);
}

bootstrap();