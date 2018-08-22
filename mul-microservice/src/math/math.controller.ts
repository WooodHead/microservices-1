import { Controller, Get } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { ClientRMQ } from "common/custom-transports/rabbitmq.client";
import { Observable } from 'rxjs';

interface Suma {
  sum: number;
}

interface Divide {
  divide: number;
}

@Controller()
export class MathController {
  client: ClientProxy = new ClientRMQ({
    transport: 'RMQ',
    options: {
      url: 'amqp://localhost:5672',
      queue: 'test',
      queueOptions: { durable: false },
    },
  });

  // CODIGO PARA CONECTARLOS VIA REDIS
  // @Client({
  //   transport: Transport.REDIS,
  //   options: {
  //     url: 'redis://localhost:6379',
  //   },
  // })
  // client: ClientProxy;

  // CODIGO PARA CONECTARLOS VIA TCP
  // @Client({
  //   transport: Transport.TCP,
  //   options: {
  //     port: 3000,
  //   },
  // })
  // client: ClientProxy;

  @Get()
  call(): Observable<number> {
    const pattern = { cmd: 'mul' };
    const data = [1, 2, 3, 4, 5];
    return this.client.send<number>(pattern, data);
  }

  @MessagePattern({ cmd: 'sum' })
  sum(data: number[]): Suma {
    console.log('hola');
    const totalSum = (data || []).reduce((a, b) => a + b);
    return { sum: totalSum };
  }

  @MessagePattern({ cmd: 'sumAndDivide' })
  sumAndDivide(data: number[]): Observable<Divide> {
    console.log('LLAMA A SUMAR')
    const totalSum = (data || []).reduce((a, b) => a + b);
    return this.client.send<Divide>({ cmd: 'divide'}, { sum: totalSum });
  }
}
