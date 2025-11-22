/**
 * LOAD TEST (Teste de Carga)
 * Cenário: Marketing anunciou promoção com pico de 50 usuários simultâneos
 * Alvo: Endpoint /checkout/simple (I/O Bound)
 * SLA: p95 < 500ms e erros < 1%
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp-up: 0 a 50 usuários em 1 minuto
    { duration: '2m', target: 50 },   // Platô: Mantém 50 usuários por 2 minutos
    { duration: '30s', target: 0 },   // Ramp-down: 50 a 0 usuários em 30 segundos
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% das requisições abaixo de 500ms
    http_req_failed: ['rate<0.01'],    // Menos de 1% de erros
  },
};

export default function () {
  const payload = JSON.stringify({
    userId: Math.floor(Math.random() * 10000),
    items: [
      { productId: 'PROD-001', quantity: 2, price: 99.90 },
      { productId: 'PROD-002', quantity: 1, price: 149.90 }
    ],
    total: 349.70
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('http://localhost:3000/checkout/simple', payload, params);
  
  check(res, {
    'status é 201': (r) => r.status === 201,
    'status é APPROVED': (r) => r.json('status') === 'APPROVED',
    'possui ID de transação': (r) => r.json('id') !== undefined,
    'tempo de resposta OK': (r) => r.timings.duration < 500,
  });
  
  sleep(1); 
}