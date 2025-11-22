/**
 * SPIKE TEST (Teste de Pico)
 * Cenário: Flash Sale - Abertura de venda de ingressos
 * Simula pico repentino de tráfego (ex: Black Friday)
 * Alvo: Endpoint /checkout/simple
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Carga baixa inicial: 10 usuários
    { duration: '10s', target: 300 },  // SPIKE! Salta para 300 usuários em 10s
    { duration: '1m', target: 300 },   // Mantém pico por 1 minuto
    { duration: '10s', target: 10 },   // Queda imediata para 10 usuários
    { duration: '30s', target: 10 },   // Mantém carga baixa
    { duration: '10s', target: 0 },    // Finaliza
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // Durante spike, aceita até 1s no p95
    http_req_failed: ['rate<0.05'],     // Máximo 5% de erros
  },
};

export default function () {
  const payload = JSON.stringify({
    userId: Math.floor(Math.random() * 10000),
    items: [
      { 
        productId: 'TICKET-VIP-001', 
        quantity: 1, 
        price: 599.90,
        eventName: 'Flash Sale - Ingresso Show' 
      }
    ],
    total: 599.90,
    timestamp: new Date().toISOString()
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('http://localhost:3000/checkout/simple', payload, params);
  
  check(res, {
    'status é 201': (r) => r.status === 201,
    'transação aprovada': (r) => r.json('status') === 'APPROVED',
    'possui ID': (r) => r.json('id') !== undefined,
  });
  
  sleep(Math.random() * 2); // Comportamento mais aleatório no spike (0-2s)
}

