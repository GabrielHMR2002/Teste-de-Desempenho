/**
 * STRESS TEST (Teste de Estresse)
 * Objetivo: Descobrir quantos usuários fazendo cálculos de criptografia derrubam o servidor
 * Alvo: Endpoint /checkout/crypto (CPU Heavy)
 * Cenário: Aumenta carga agressivamente até encontrar o Breaking Point
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 200 },   // 0 a 200 usuários em 2 minutos
    { duration: '2m', target: 500 },   // 200 a 500 usuários em 2 minutos
    { duration: '2m', target: 1000 },  // 500 a 1000 usuários em 2 minutos
    { duration: '1m', target: 0 },     // Ramp-down para recuperação
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<3000'],  
    http_req_failed: ['rate<0.1'],      
  },
};

export default function () {
  const payload = JSON.stringify({
    userId: Math.floor(Math.random() * 10000),
    secureData: {
      cardNumber: '4532-****-****-1234',
      cvv: '***',
      amount: 1500.00
    }
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '60s', // Timeout maior para operações CPU-heavy
  };

  const res = http.post('http://localhost:3000/checkout/crypto', payload, params);
  
  check(res, {
    'status é 201': (r) => r.status === 201,
    'status é SECURE_TRANSACTION': (r) => r.json('status') === 'SECURE_TRANSACTION',
    'possui hash': (r) => r.json('hash') !== undefined,
  });
  
  sleep(0.5); // Apenas 0.5 segundos entre requisições
}

